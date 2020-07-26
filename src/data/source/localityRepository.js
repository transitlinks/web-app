import { getLog } from '../../core/log';
const log = getLog('data/source/localityRepository');

import sequelize from '../sequelize';
import { Terminal } from '../models';

export default {

  getCheckInLocalities: async (options) => {
    let query = `SELECT DISTINCT locality FROM "CheckIn"`;
    if (options.search) query += ` WHERE locality ILIKE '%${options.search}%'`;
    if (options.limit) query += ' LIMIT ' + options.limit;
    if (options.offset) query += ' OFFSET ' + options.offset;
    const localities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return localities.map(locality => locality.locality);
  },

  getMostTravelledLocalities: async (options) => {

    let query = 'SELECT t."locality" FROM "Terminal" t';

    const searchParams = [];
    if (options.search) searchParams.push(`t."locality" ILIKE '%${options.search}%'`);
    if (options.transport) searchParams.push(`t."transport" = '${options.transport}'`);
    if (options.transportTypes && options.transportTypes.length > 0) {
      const transportTypesQuery = ' (' + options.transportTypes
        .map(type => `t."transport" = '${type}'`)
        .join(' OR ') + ')';
      searchParams.push(transportTypesQuery);
    }
    if (searchParams.length > 0) query += ` WHERE ${searchParams.join(' AND ')}`;

    query += ' GROUP BY t."locality" ORDER BY COUNT(t."id") DESC';
    if (options.offset) query += ` OFFSET ${options.offset}`;
    if (options.limit) query += ` LIMIT ${options.limit}`;

    const localities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return localities.map(locality => locality.locality);

  },

  getTerminalsByLocality: async (locality) => {
    const query = `SELECT * FROM "Terminal" WHERE "checkInId" IN (SELECT id FROM "CheckIn" WHERE locality = '${locality}') ORDER BY "createdAt" DESC;`;
    const terminals = await sequelize.query(query, { model: Terminal, mapToModel: true });
    return terminals;
  }

};
