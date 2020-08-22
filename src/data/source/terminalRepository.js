import { getLog } from '../../core/log';
const log = getLog('data/source/terminalRepository');

import sequelize from '../sequelize';
import { Terminal, CheckIn, Post } from '../models';
import postRepository from './postRepository';
import { checkInRepository, terminalRepository } from './index';

export default {

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
      include: [ { all: true } ]
    });

    return terminals;

  },

  getRoute: async (from, to) => {

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

    const query = `
      SELECT x.path_id, x.path_seq, t.*,
        CASE
           WHEN edge = -1 THEN agg_cost ELSE NULL END AS "total_cost"
        FROM
            pgr_ksp(
                    'SELECT id, source, target, distance AS cost FROM "Connection"',
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

    const routes = {
    };

    const departures = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    for (let i = 0; i < departures.length; i++) {
      if (departures[i].linkedTerminalId) {
        departures[i].linkedTerminal = await terminalRepository.getTerminal({ id: departures[i].linkedTerminalId });
        departures[i].checkIn = await checkInRepository.getCheckIn({ id: departures[i].checkInId });
        //console.log('PATH ID', departures[i].path_id);
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


  getInterTerminalsByLocality: async (locality, query = {}) => {

    const terminals = await Terminal.findAll({
      where: {
        linkedLocality: { $ne: sequelize.col('Terminal.locality') },
        locality,
        ...query
      },
      include: [{ all: true }]
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

      return await Terminal.findOne({ where: { uuid: terminal.uuid }});

    }

    const created = await Terminal.create(terminal);

    if (!created) {
      throw new Error('Failed to create a terminal (null result)');
    }

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

};
