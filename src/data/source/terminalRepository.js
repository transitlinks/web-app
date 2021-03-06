import { getLog } from '../../core/log';
const log = getLog('data/source/terminalRepository');

import sequelize from '../sequelize';
import { Terminal, CheckIn, Post, User } from '../models';
import postRepository from './postRepository';
import { checkInRepository, terminalRepository } from './index';
import {
  OPEN_TRIP_QUERY_FROM,
  OPEN_TRIP_QUERY_WHERE,
  TRIP_QUERY_FROM,
  TRIP_QUERY_WHERE,
} from './queries';

const updateTerminalGeom = async (terminalId) => {
  const updateGeom = `UPDATE "Terminal" SET geom = ST_SetSRID(ST_Point(latitude, longitude), 4326) WHERE id = ${terminalId}`;
  await sequelize.query(updateGeom);
};

export default {

  getIdByUuid: async (uuid) => {

    const terminal = await Terminal.findOne({
      attributes: [ 'id' ],
      where: { uuid }
    });

    return terminal ? terminal.id : null;

  },

  getUuidById: async (id) => {

    const terminal = await Terminal.findOne({
      attributes: [ 'uuid' ],
      where: { id }
    });

    return terminal ? terminal.uuid : null;

  },

  getTerminal: async (where, options) => {

    let terminal = await Terminal.findOne({
      where,
      include: [ { all: true } ],
      ...options
    });

    return terminal;

  },

  getTerminals: async (where, options) => {

    let terminals = await Terminal.findAll({
      where,
      include: [ { all: true } ],
      ...options
    });

    return terminals;

  },

  getRoute: async (from, to, params) => {

    /*
    const query = `
      SELECT
    t.*
      FROM
          pgr_dijkstra(
                  'SELECT id, source, target, distance AS cost FROM "Connection"',
                  (SELECT id FROM "Locality" WHERE name = '${from}'),
                  (SELECT id FROM "Locality" WHERE name = '${to}'),
                  FALSE
              ) AS p
              LEFT JOIN "Connection" AS c ON p.edge = c.id
              LEFT JOIN "Locality" AS l ON p.node = l.id
              LEFT JOIN "Terminal" AS t ON c."sourceTerminalId" = t.id
      ORDER BY
          p.seq
    `;
     */

    let costExpression = 'distance';
    if (params) {
      const { transportTypes } = params;
      if (transportTypes) {
        costExpression = `(distance / (1 + ((transport IN (${transportTypes.map(t => `''${t}''`).join(',')}))::integer * 999)))`;
      }
    }

    const query = `
      SELECT x.path_id, x.path_seq, x.cost, t.*,
        CASE
           WHEN edge = -1 THEN agg_cost ELSE NULL END AS "total_cost"
        FROM
            pgr_ksp(
                    'SELECT id, source, target, ${costExpression} AS cost FROM "Connection"',
                    (SELECT id FROM "Locality" WHERE uuid = '${from}'),
                    (SELECT id FROM "Locality" WHERE uuid = '${to}'),
                    5,
                    directed := TRUE
                ) as x
                LEFT JOIN "Connection" AS c ON x.edge = c.id
                LEFT JOIN "Terminal" AS t ON t."id" = c."sourceTerminalId"
        ORDER BY
            x.path_id, x.path_seq;
    `;

    console.log('ROUTE QUERY', query);
    const departures = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    let routes = {};
    for (let i = 0; i < departures.length; i++) {
      if (departures[i].linkedTerminalId) {
        departures[i].linkedTerminal = await terminalRepository.getTerminal({ id: departures[i].linkedTerminalId });
        departures[i].checkIn = await checkInRepository.getCheckIn({ id: departures[i].checkInId });
        if (!routes[departures[i].path_id]) routes[departures[i].path_id] = { cost: 0, departures: [] };
        routes[departures[i].path_id].departures.push(departures[i]);
        routes[departures[i].path_id].cost += Math.round(departures[i].cost);
      }
    }

    const sortedRoutes = {};
    const routeCosts = Object.keys(routes).map(pathId => routes[pathId].cost).sort((a, b) => a - b);
    for (let i = 0; i < routeCosts.length; i++) {
      sortedRoutes[`${i + 1}`] = routes[Object.keys(routes).find(pathId => routes[pathId].cost === routeCosts[i])].departures;
    }

    return sortedRoutes;

  },

  getInternalDeparturesByLocality: async (localityUuid, query = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $eq: sequelize.col('Terminal.localityUuid') },
        localityUuid,
        type: 'departure',
        ...query
      },
      include: [{ all: true }]
    });

    return terminals;

  },

  getLinkedLocalitiesByLocality: async (query = {}) => {

    const linkedLocalities = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $ne: sequelize.col('Terminal.localityUuid') },
        ...query
      },
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('linkedLocalityUuid')), 'linkedLocalityUuid'],
        'linkedLocality'
      ],
      group: ['Terminal.linkedLocalityUuid', 'Terminal.linkedLocality'],
      raw: true
    });

    return linkedLocalities;

  },

  countInterTerminals: async (query = {}) => {

    const counts = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $ne: sequelize.col('Terminal.localityUuid') },
        ...query
      },
      attributes: ['type', [sequelize.fn('count', sequelize.col('type')), 'count']],
      group: ['Terminal.type'],
      raw: true,
      order: sequelize.literal('count DESC')
    });

    const terminalCounts = {
    };

    for (let i = 0; i < counts.length; i++) {
      terminalCounts[counts[i].type] = counts[i].count;
    }

    return terminalCounts;

  },


  getInterTerminalsByLocality: async (localityUuid, query = {}, options = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocalityUuid: { $ne: sequelize.col('Terminal.localityUuid') },
        linkedTerminalId: { $ne: null },
        localityUuid,
        ...query
      },
      include: [{ all: true }],
      ...options
    });

    return terminals;

  },

  getInterTerminalsByTag: async (tag, userId) => {

    const checkIns = await CheckIn.findAll({
      where: {
        tag: { $ne: sequelize.col('Terminal.locality') },
        locality
      },
      include: [{ all: true }]
    });

    return terminals;

  },

  getTerminalCountByTag: async (tag) => {
    const query = `SELECT COUNT(t."id") FROM "Terminal" trm, "CheckIn" ci, "EntityTag" et, "Tag" t WHERE et."tagId"= t.id AND ci."id" = et."checkInId" AND trm."checkInId" = ci."id" AND t."value" = '${tag}'`;
    const terminalCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    if (terminalCount.length === 1) {
      return terminalCount[0].count;
    } else {
      return -1;
    }
  },

  getTerminalCountByTrip: async (tripId, open) => {

    const query = `SELECT COUNT(term.id)
      ${open ? OPEN_TRIP_QUERY_FROM : TRIP_QUERY_FROM}, "Terminal" term
      WHERE t.id = ${tripId}
      ${open ? OPEN_TRIP_QUERY_WHERE : TRIP_QUERY_WHERE}
      AND term."checkInId" = ci.id AND term."linkedTerminalId" IS NOT NULL AND term."type" = 'departure';
    `;

    const terminalCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    if (terminalCount.length === 1) {
      return terminalCount[0].count;
    }

    return -1;

  },

  getTerminalCountByLocality: async (localityUuid) => {
    const query = `SELECT count(id) FROM "Terminal" WHERE "localityUuid" = '${localityUuid}' AND "linkedLocalityUuid" != "localityUuid"`;
    const terminalCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    if (terminalCount.length === 1) {
      return terminalCount[0].count;
    } else {
      return -1;
    }
  },

  getTerminalCountByCountry: async (country) => {
    const query = `SELECT count(id) FROM "Terminal" WHERE "country" = '${country}' AND "linkedLocality" != "locality"`;
    const terminalCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    if (terminalCount.length === 1) {
      return terminalCount[0].count;
    } else {
      return -1;
    }
  },

  saveTerminal: async (terminal) => {

    if (terminal.uuid || terminal.id) {

      const result = await Terminal.update(terminal, {
        where: terminal.uuid ? { uuid: terminal.uuid } : { id: terminal.id }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid terminal update result: ${result}`);
      }

      const updated = await Terminal.findOne({
        where: terminal.uuid ? { uuid: terminal.uuid } : { id: terminal.id },
        include: [{ all: true }]
      });
      await updateTerminalGeom(updated.id);
      return updated;

    }

    let created = await Terminal.create(terminal);

    if (!created) {
      throw new Error('Failed to create a terminal (null result)');
    }

    await updateTerminalGeom(created.id);
    created = await Terminal.findOne({ where: { id: created.id }, include: [{ all: true }] });
    return created;

  },

  updateTerminals: async (where, values, options = {}) => {
    const result = await Terminal.update(values, { where, ...options });
    if (result.length !== 1) {
      throw new Error(`Invalid terminal update result: ${result}`);
    }
    return result[0] !== 1;
  },

  deleteTerminal: async (uuid) => {

    const terminal = await Terminal.findOne({ where: { uuid }});

    if (!terminal) {
      throw new Error('Could not find terminal with uuid ' + uuid);
    }

    await terminal.destroy();
    return terminal;

  },

  saveConnection: async (sourceTerminalId, targetTerminalId, distance) => {

    const existingConnections = await sequelize.query(
      `SELECT id FROM "Connection" 
                WHERE "sourceTerminalId" = ${sourceTerminalId}
                AND "targetTerminalId" = ${targetTerminalId}`
    );

    const fields = {
      '"sourceLocality"': 't."localityUuid"',
      '"targetLocality"': 'lt."localityUuid"',
      '"sourceFormattedAddress"': 't."formattedAddress"',
      '"targetFormattedAddress"': 'lt."formattedAddress"',
      '"transport"': 't."transport"',
      'geom': 'ST_MakeLine(t.geom, lt.geom)::GEOMETRY(LineString,4326)',
      'distance': distance || 'ST_Distance(t.geom::GEOGRAPHY, lt.geom::GEOGRAPHY)/1000',
      'source': 'tl.id',
      'target': 'ltl.id',
      '"sourceTerminalId"': 't.id',
      '"targetTerminalId"': 'lt.id'
    };


    const updateStatement = `
      UPDATE "Connection" SET ${Object.keys(fields).map(field => `${field} = ${fields[field]}`).join(', ')}
      FROM "Terminal" t, "Terminal" lt, "Locality" tl, "Locality" ltl
      WHERE 
        "sourceTerminalId" = ${sourceTerminalId} AND
        "targetTerminalId" = ${targetTerminalId} AND
        t.id = "sourceTerminalId" AND
        lt.id = "targetTerminalId" AND
        lt.id = t."linkedTerminalId" AND
        t."localityUuid" = tl.uuid::varchar AND
        lt."localityUuid" = ltl.uuid::varchar
    `;

    const insertStatement = `
      INSERT INTO "Connection" (${Object.keys(fields).join(', ')})
        SELECT ${Object.keys(fields).map(field => `${fields[field]} AS ${field}`).join(', ')}
        FROM "Terminal" t, "Terminal" lt, "Locality" tl, "Locality" ltl
        WHERE
            t.id = ${sourceTerminalId} AND 
            t."linkedTerminalId" = lt.id AND 
            t."localityUuid" = tl.uuid::varchar AND 
            lt."localityUuid" = ltl.uuid::varchar 
    `;

    const query = existingConnections[0].length > 0 ? updateStatement : insertStatement;
    await sequelize.query(query);

  },

  deleteConnection: async ({ sourceTerminalId, targetTerminalId }, andOr) => {
    const params = {};
    if (sourceTerminalId) params.sourceTerminalId = sourceTerminalId;
    if (targetTerminalId) params.targetTerminalId = targetTerminalId;
    const fields = Object.keys(params);
    const where = fields.map(field => `"${field}" = ${params[field]}`).join(` ${andOr} `);
    await sequelize.query(`DELETE FROM "Connection" WHERE ${where}`);
  },

  getRoutePoints: async (terminal) => {

    const linkedTerminal = terminal.linkedTerminalId ?
      await Terminal.findOne({ where: { id: terminal.linkedTerminalId } }) :
      null;

    if (linkedTerminal) {
      const departure = terminal.type === 'departure' ? terminal : linkedTerminal;
      const arrival = terminal.type === 'arrival' ? terminal : linkedTerminal;
      const query = `
        SELECT latitude, longitude, locality, "createdAt" FROM "CheckIn" ci
          WHERE "userId" = ${terminal.userId}
          AND "createdAt" BETWEEN '${departure.createdAt.toISOString()}' AND '${arrival.createdAt.toISOString()}'
          AND NOT EXISTS (SELECT id FROM "Terminal" WHERE "checkInId" = ci.id)
          AND id NOT IN (${departure.checkInId}, ${arrival.checkInId})
          ORDER BY "createdAt" ASC
        `;
      const routePoints = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
      return routePoints;
    }

    return [];

  },

  getTotalDistance: async (route) => {

    const distances = [];

    for (let i = 0; i < route.length - 1; i++) {
      const point = route[i];
      const nextPoint = route[i + 1];
      const query = `
        SELECT ST_Distance(ST_SetSRID(ST_Point(${point.latitude}, ${point.longitude}), 4326)::GEOGRAPHY, ST_SetSRID(ST_Point(${nextPoint.latitude}, ${nextPoint.longitude}), 4326)::GEOGRAPHY)/1000 AS distance
      `;
      const distanceResult = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
      if (distanceResult.length > 0) distances.push(distanceResult[0].distance);
    }

    let totalDistance = 0;

    for (let i = 0; i < distances.length; i++) {
      totalDistance += distances[i];
    }

    return totalDistance;

  },

  getDepartureBefore: async (dateTime, userId, checkIn) => {

    const query = { createdAt: { $lte: dateTime } };
    if (userId) query.userId = userId;
    if (checkIn) query.checkInId = { $ne: checkIn.id };

    const terminal = await Terminal.findOne({
      where: query,
      order: [[ 'createdAt', 'DESC' ]],
      include: {
        all: true
      }
    });

    return (terminal && terminal.type === 'departure') ? terminal : null;

  },

  getArrivalAfter: async (dateTime, userId, checkIn) => {
    const query = {
      createdAt: { $gt: dateTime },
      userId
    };

    if (checkIn) query.checkInId = { $ne: checkIn.id };

    const terminal = await Terminal.findOne({
      where: query,
      order: [[ 'createdAt', 'ASC' ]],
      include: {
        all: true
      }
    });

    return (terminal && terminal.type === 'arrival') ? terminal : null;

  },

  getTerminalsBetween: async (departureDateTime, arrivalDateTime, userId, terminal, linkedTerminal) => {

    const terminalId = terminal ? terminal.id : null;
    const linkedTerminalId = linkedTerminal ? linkedTerminal.id : null;

    let query = `
        SELECT * FROM "Terminal" 
        WHERE "createdAt" > '${departureDateTime.toISOString()}'
        AND "createdAt" < '${arrivalDateTime.toISOString()}'
        AND "userId" = ${userId}`;

    if (terminalId) query += ` AND id != ${terminalId}`;
    if (linkedTerminalId) query += ` AND id != ${linkedTerminalId}`;

    return await sequelize.query(query, { model: Terminal, mapToModel: true });

  },

  setLocalityAdminLevel: async (locality, country, adminArea1, adminArea2) => {

    let where = '';
    if (adminArea1) where += ` AND loc."country" = '${country}'`;
    if (adminArea2) where += ` AND loc."adminArea1" = '${adminArea1}'`;

    const localityQuery = `
        UPDATE "Terminal" t SET "localityLong" = loc."nameLong"
          FROM "Locality" loc
          WHERE t.locality = '${locality}'
            ${where}
            AND loc.uuid = t."localityUuid"::uuid;
    `;

    const linkedLocalityQuery = `
        UPDATE "Terminal" t SET "linkedLocalityLong" = loc."nameLong"
          FROM "Locality" loc
          WHERE t."linkedLocality" = '${locality}'
            ${where}
            AND loc.uuid = t."linkedLocalityUuid"::uuid;
    `;

    console.log('terminal admin lvl', localityQuery);
    console.log('lnkd terminal admin lvl', linkedLocalityQuery);

    await sequelize.query(localityQuery);
    await sequelize.query(linkedLocalityQuery);

  },

};
