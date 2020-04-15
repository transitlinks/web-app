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

  getTerminalsByLocality: async (locality) => {
    const query = `SELECT * FROM "Terminal" WHERE "checkInId" IN (SELECT id FROM "CheckIn" WHERE locality = '${locality}') ORDER BY "createdAt" DESC;`;
    const terminals = await sequelize.query(query, { model: Terminal, mapToModel: true });
    return terminals;
  }

};
