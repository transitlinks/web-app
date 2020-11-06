import { getLog } from '../../core/log';
const log = getLog('data/source/localityRepository');

import sequelize from '../sequelize';
import { Terminal, Locality } from '../models';
import { getOpenTripQuery, getTripQuery } from './queries';

export default {

  getCheckInLocalities: async (options) => {
    let query = `SELECT DISTINCT locality FROM "CheckIn"`;
    if (options.locality) query += ` WHERE locality = '${options.locality}'`;
    else if (options.search) query += ` WHERE locality ILIKE '%${options.search}%'`;
    if (options.limit) query += ' LIMIT ' + options.limit;
    if (options.offset) query += ' OFFSET ' + options.offset;
    const localities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return localities.map(locality => locality.locality);
  },

  getMostTravelledLocalities: async (options) => {

    let query = 'SELECT t."locality" FROM "Terminal" t';

    const searchParams = [];
    if (options.locality) searchParams.push(`t."locality" = '${options.locality}'`);
    else if (options.search) searchParams.push(`t."locality" ILIKE '%${options.search}%'`);
    if (options.transport) searchParams.push(`t."transport" = '${options.transport}'`);
    searchParams.push('t."linkedTerminalId" IS NOT NULL');
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

    console.log('LAST LOCS QUERY', query);
    const localities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return localities.map(locality => locality.locality);

  },

  getLocalityCountByTag: async (tag) => {
    let query = `SELECT COUNT(DISTINCT et."locality") FROM "EntityTag" et, "Tag" t WHERE et."tagId"= t.id AND t."value" = '${tag}'`;
    const localityCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    if (localityCount.length === 1) {
      return localityCount[0].count;
    } else {
      return -1;
    }
  },

  getLocalitiesByTag: async (tag, limit) => {
    let query = `SELECT DISTINCT et."locality" FROM "EntityTag" et, "Tag" t WHERE et."tagId"= t.id AND t."value" = '${tag}'`;
    if (limit) query += ` LIMIT ${limit}`;
    const localities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return localities.map(locality => locality.locality);
  },

  getLocalityCountByTrip: async (tripId, open) => {
    const query = `SELECT COUNT(DISTINCT ci."locality") ${open ? getOpenTripQuery(tripId) : getTripQuery(tripId)}`;
    const localityCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    if (localityCount.length === 1) {
      return localityCount[0].count;
    }
    return -1;
  },

  getLocalitiesByTrip: async (tripId, open, limit) => {
    let query = `SELECT DISTINCT ci."locality" ${open ? getOpenTripQuery(tripId) : getTripQuery(tripId)}`;
    if (limit) query += ` LIMIT ${limit}`;
    const localities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return localities.map(locality => locality.locality);
  },

  getTerminalsByLocality: async (locality) => {
    const query = `SELECT * FROM "Terminal" WHERE "checkInId" IN (SELECT id FROM "CheckIn" WHERE locality = '${locality}') ORDER BY "createdAt" DESC;`;
    const terminals = await sequelize.query(query, { model: Terminal, mapToModel: true });
    return terminals;
  },

  saveLocality: async (locality) => {
    const existing = await Locality.findOne({ where: { name: locality } });
    if (!existing) {
      await Locality.create({ name: locality });
    }
  }

};
