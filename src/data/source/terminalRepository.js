import { getLog } from '../../core/log';
const log = getLog('data/source/terminalRepository');

import sequelize from '../sequelize';
import { Terminal, CheckIn, Post, User } from '../models';
import postRepository from './postRepository';
import { checkInRepository, terminalRepository } from './index';

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
      include: [ { all: true } ]
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
        costExpression = `(distance + (1 - (transport IN (${transportTypes.map(t => `''${t}''`).join(',')}))::integer) * 1000000)`;
      }
    }

    const query = `
      SELECT x.path_id, x.path_seq, t.*,
        CASE
           WHEN edge = -1 THEN agg_cost ELSE NULL END AS "total_cost"
        FROM
            pgr_ksp(
                    'SELECT id, source, target, ${costExpression} AS cost FROM "Connection"',
                    (SELECT id FROM "Locality" WHERE name = '${from}'),
                    (SELECT id FROM "Locality" WHERE name = '${to}'),
                    5,
                    directed := TRUE
                ) as x
                LEFT JOIN "Connection" AS c ON x.edge = c.id
                LEFT JOIN "Terminal" AS t ON t."id" = c."sourceTerminalId"
        ORDER BY
            x.path_id, x.path_seq;
    `;

    console.log('GET ROUTE QUERY', query);

    const departures = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    const routes = {};
    for (let i = 0; i < departures.length; i++) {
      if (departures[i].linkedTerminalId) {
        departures[i].linkedTerminal = await terminalRepository.getTerminal({ id: departures[i].linkedTerminalId });
        departures[i].checkIn = await checkInRepository.getCheckIn({ id: departures[i].checkInId });
        if (!routes[departures[i].path_id]) routes[departures[i].path_id] = [];
        routes[departures[i].path_id].push(departures[i]);
      }
    }

    return routes;

  },

  getInternalDeparturesByLocality: async (locality, query = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocality: { $eq: sequelize.col('Terminal.locality') },
        locality,
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
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
        ...query
      },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('linkedLocality')), 'linkedLocality']],
      group: ['Terminal.linkedLocality'],
      raw: true
    });

    return linkedLocalities.map(loc => loc.linkedLocality);

  },

  countInterTerminals: async (query = {}) => {

    const counts = await Terminal.findAll({
      where: {
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
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


  getInterTerminalsByLocality: async (locality, query = {}, options = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
        linkedTerminalId: { $ne: null },
        locality,
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

  getTerminalCountByLocality: async (locality) => {
    const query = `SELECT count(id) FROM "Terminal" WHERE "locality" = '${locality}' AND "linkedLocality" != "locality"`;
    const terminalCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    if (terminalCount.length === 1) {
      return terminalCount[0].count;
    } else {
      return -1;
    }
  },

  saveTerminal: async (terminal) => {

    if (terminal.uuid) {

      const result = await Terminal.update(terminal, {
        where: { uuid: terminal.uuid }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid terminal update result: ${result}`);
      }

      const updated = await Terminal.findOne({
        where: { uuid: terminal.uuid },
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

    console.log('EXISTING', existingConnections[0]);

    const fields = {
      '"sourceLocality"': 't.locality',
      '"targetLocality"': 'lt.locality',
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
        t.locality = tl.name AND
        lt.locality = ltl.name
    `;

    const insertStatement = `
      INSERT INTO "Connection" (${Object.keys(fields).join(', ')})
        SELECT ${Object.keys(fields).map(field => `${fields[field]} AS ${field}`).join(', ')}
        FROM "Terminal" t, "Terminal" lt, "Locality" tl, "Locality" ltl
        WHERE
            t.id = ${sourceTerminalId} AND 
            t."linkedTerminalId" = lt.id AND 
            t.locality = tl.name AND 
            lt.locality = ltl.name
    `;

    const query = existingConnections[0].length > 0 ? updateStatement : insertStatement;
    console.log('CONN QUERY', query);
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
      console.log('ROUTEPOINT QUERY', query);
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
      console.log('dist query', query);
      const distanceResult = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
      if (distanceResult.length > 0) distances.push(distanceResult[0].distance);
      console.log(distanceResult);
    }

    let totalDistance = 0;

    for (let i = 0; i < distances.length; i++) {
      totalDistance += distances[i];
    }

    return totalDistance;

  },

  getDepartureBefore: async (dateTime, userId, checkIn) => {
    const query = {
      createdAt: { $lt: dateTime },
      userId
    };

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

  }

};
