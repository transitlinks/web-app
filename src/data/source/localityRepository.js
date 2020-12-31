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

    let query = 'SELECT t."locality", t."localityLong", t."localityUuid" FROM "Terminal" t';

    const searchParams = [];
    if (options.locality) searchParams.push(`t."locality" = '${options.locality}'`);
    else if (options.localityUuid) searchParams.push(`t."localityUuid" = '${options.localityUuid}'`);
    else if (options.search) searchParams.push(`t."locality" ILIKE '%${options.search}%' OR t."country" ILIKE '%${options.search}%'`);
    if (options.transport) searchParams.push(`t."transport" = '${options.transport}'`);
    searchParams.push('t."linkedTerminalId" IS NOT NULL');
    if (options.transportTypes && options.transportTypes.length > 0) {
      const transportTypesQuery = ' (' + options.transportTypes
        .map(type => `t."transport" = '${type}'`)
        .join(' OR ') + ')';
      searchParams.push(transportTypesQuery);
    }
    if (searchParams.length > 0) query += ` WHERE ${searchParams.join(' AND ')}`;

    query += ' GROUP BY t."locality", t."localityLong", t."localityUuid" ORDER BY COUNT(t."id") DESC';
    if (options.offset) query += ` OFFSET ${options.offset}`;
    if (options.limit) query += ` LIMIT ${options.limit}`;

    const localities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return localities;

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

  getLocality: async (where) => {
    const locality = await Locality.findOne({ where });
    return locality;
  },

  getLocalities: async (where) => {
    const localities = await Locality.findAll({ where });
    return localities;
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

    const { uuid } = locality;
    delete locality.uuid;

    if (uuid) {
      const existingLocality = await Locality.findOne({ where: { uuid } });
      if (!existingLocality) throw new Error('Locality with uuid ' + uuid + ' not found.');
      return await Locality.update(locality, { where: { uuid: existingLocality.uuid } });
    }

    const createdLocality = await Locality.create(locality);
    return createdLocality;

  },

  deleteLocalities: async (where) => {
    return await Locality.destroy({ where });
  },

  setAdminLevel: async (locality, country, adminLevel1, adminLevel2) => {

    let adminLevel = '';
    if (country) adminLevel = ` || ', ' || loc.country`;
    if (adminLevel1) adminLevel = ` || ', ' || loc."adminArea1" || ', ' || loc.country`;
    if (adminLevel2) adminLevel = ` || ', ' || loc."adminArea2" || ', ' || loc."adminArea1"`;

    let adminLevelQuery = '';
    if (country) adminLevelQuery = ` AND loc.country = '${country}'`;
    if (adminLevel1) adminLevelQuery = ` AND loc.country = '${country}'`;
    const query = `
        UPDATE "Locality" loc SET "nameLong" = loc.name ${adminLevel}
          WHERE loc.name = '${locality}'
            ${adminLevelQuery}
    `;

    await sequelize.query(query);

    if (!adminLevel1) {

      const otherLocsQuery = `
        UPDATE "Locality" loc SET "nameLong" = loc.name ${adminLevel}
          WHERE loc.name = '${locality}' AND loc.country != '${country}' AND loc."nameLong" = '${locality}'
        `;
      await sequelize.query(otherLocsQuery);

    }

  },

  searchLocalitiesByName: async (search) => {

    const localities = await Locality.findAll({
      where: {
        name: { $ilike: `%${search}%` }
      }
    });

    return localities;

  }

};
