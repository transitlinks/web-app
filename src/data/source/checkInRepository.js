import { getLog } from '../../core/log';
const log = getLog('data/source/checkInRepository');

import sequelize from '../sequelize';
import { CheckIn, EntityTag, Tag, Terminal, User } from '../models';
import { getTripQuery, getOpenTripQuery } from './queries';

export default {

  getCheckInIdByUuid: async (uuid) => {

    const checkIn = await CheckIn.findOne({
      attributes: [ 'id' ],
      where: { uuid }
    });

    return checkIn ? checkIn.id : null;

  },

  getCheckIn: async (where, options = {}) => {

    const checkIn = await CheckIn.findOne({
      where,
      ...options,
      include: [ { all: true } ]
    });

    return checkIn;

  },

  getCheckInWithPostsByLocality: async (localityUuid) => {

    let queryWithPhotos = `SELECT ci.* FROM "CheckIn" ci, "Post" p, "MediaItem" mi WHERE ci."localityUuid" = '${localityUuid}' AND ci."id" = p."checkInId" AND mi."entityUuid" = p."uuid"::varchar`;
    let queryWithoutPhotos = `SELECT ci.* FROM "CheckIn" ci, "Post" p WHERE ci."localityUuid" = '${localityUuid}' AND ci."id" = p."checkInId"`;

    let checkIns = await sequelize.query(queryWithPhotos, { model: CheckIn, mapToModel: true });
    if (checkIns.length === 0) {
      checkIns = await sequelize.query(queryWithoutPhotos, { model: CheckIn, mapToModel: true });
    }
    if (checkIns.length === 0) return null;

    return checkIns[0];

  },

  getCheckInWithPostsByCountry: async (country) => {

    let queryWithPhotos = `SELECT ci.* FROM "CheckIn" ci, "Post" p, "MediaItem" mi WHERE ci."country" = '${country}' AND ci."id" = p."checkInId" AND mi."entityUuid" = p."uuid"::varchar`;
    let queryWithoutPhotos = `SELECT ci.* FROM "CheckIn" ci, "Post" p WHERE ci."country" = '${country}' AND ci."id" = p."checkInId"`;

    let checkIns = await sequelize.query(queryWithPhotos, { model: CheckIn, mapToModel: true });
    if (checkIns.length === 0) {
      checkIns = await sequelize.query(queryWithoutPhotos, { model: CheckIn, mapToModel: true });
    }
    if (checkIns.length === 0) return null;

    return checkIns[0];

  },

  getCheckIns: async (where, options = {}) => {

    const checkIns = await CheckIn.findAll({
      where,
      ...options,
      include: [ { all: true } ]
    });

    return checkIns;

  },

  getCheckInsByUserUuid: async (uuid) => {

    const user = await User.findOne( { where: { uuid }});
    const checkIns = await CheckIn.findAll({ where: { userId: user.id }});

    return checkIns;

  },

  getFeedCheckIns: async (where, options = {}) => {

    /*
    let query = `SELECT * FROM "CheckIn" ci`;
    const whereKeys = Object.keys(where);
    if (whereKeys.length > 0) {
      query += ' WHERE';
    }
    whereKeys.forEach(key => {
      query += ` ${key} = ${whereKeys[key]}`;
    });

    //if (options.search) query += ` WHERE locality ILIKE '%${options.search}%'`;
    if (options.limit) query += ' LIMIT ' + options.limit;
    if (options.offset) query += ' OFFSET ' + options.offset;
    const checkIns = await sequelize.query(query, { model: CheckIn, mapToModel: true });

    return checkIns;
     */

    const checkIns = await CheckIn.findAll({
      where,
      ...options,
      include: {
        all: true
      }
    });

    return checkIns;

  },

  setLocalityAdminLevel: async (locality, country, adminArea1, adminArea2) => {

    let where = '';
    if (adminArea1) where += ` AND loc."country" = '${country}'`;
    if (adminArea2) where += ` AND loc."adminArea1" = '${adminArea1}'`;

    const query = `
        UPDATE "CheckIn" ci SET "localityLong" = loc."nameLong"
          FROM "Locality" loc
          WHERE ci.locality = '${locality}'
            ${where}
            AND loc.uuid = ci."localityUuid"::uuid;
    `;

    console.log('admin level query', query);
    await sequelize.query(query);

  },

  saveCheckIn: async (checkIn) => {

    const { locality, adminArea1, adminArea2, country, formattedAddress } = checkIn;
    if (locality) checkIn.locality = locality.replaceAll("'", "\\'");
    if (adminArea1) checkIn.adminArea1 = adminArea1.replaceAll("'", "\\'");
    if (adminArea2) checkIn.adminArea2 = adminArea2.replaceAll("'", "\\'");
    if (country) checkIn.country = country.replaceAll("'", "\\'");
    if (formattedAddress) checkIn.formattedAddress = formattedAddress.replaceAll("'", "\\'");

    if (checkIn.id || checkIn.uuid) {

      const query = checkIn.id ? { id: checkIn.id } : { uuid: checkIn.uuid };
      const result = await CheckIn.update(checkIn, {
        where: query
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid check-in update result: ${result}`);
      }

      return await CheckIn.findOne({ where: query });

    }

    const created = await CheckIn.create(checkIn);

    if (!created) {
      throw new Error('Failed to create a check-in (null result)');
    }

    return created;

  },

  deleteCheckIns: async (where, options = {}) => {

    const deleteResult = await CheckIn.destroy({
      where,
      ...options
    });

    return deleteResult;

  },

  getCheckInCount: async (localityUuid) => {
    const query = `SELECT COUNT(id) FROM "CheckIn" WHERE "localityUuid" = '${localityUuid}'`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
  },

  getCheckInCountByCountry: async (country) => {
    const query = `SELECT COUNT(id) FROM "CheckIn" WHERE country = '${country}'`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
  },

  getCheckInCountByTag: async (tag) => {
    const query = `SELECT COUNT(id) FROM "CheckIn" as ci WHERE EXISTS (SELECT 1 FROM "EntityTag" et, "Tag" t WHERE et."checkInId" = ci.id AND t.id = et."tagId" AND t."value" = '${tag}')`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
  },

  getCheckInCountByTrip: async (tripId) => {
    const query = `SELECT COUNT(ci.id) ${getTripQuery(tripId)}`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
  },

  getCheckInCountByOpenTrip: async (tripId) => {
    const query = `SELECT COUNT(ci.id) ${getOpenTripQuery(tripId)}`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
  },

  getCheckInCountByUser: async (userId) => {
    const query = `SELECT COUNT(id) FROM "CheckIn" WHERE "userId" = ${userId}`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
  },

  getTaggedCheckIns: async (tag, options) => {

    let queryWithoutPhotos = `
        SELECT ci.*
            FROM "CheckIn" ci, "Post" p, "Tag" t, "EntityTag" et
        WHERE t."value" = '${tag}' AND
            ci."id" = p."checkInId" AND
            et."checkInId" = ci."id" AND
            et."tagId" = t."id"
        GROUP BY ci."id"
        ORDER BY ci."createdAt" DESC`;

    const checkIns = await sequelize.query(queryWithoutPhotos, { model: CheckIn, mapToModel: true });

    return checkIns;

  },

  getTaggedCheckInWithPhotos: async (tag, options) => {

    let queryWithPhotos = `
        SELECT ci.*
            FROM "CheckIn" ci, "Post" p, "Tag" t, "EntityTag" et, "MediaItem" mi
        WHERE t."value" = '${tag}' AND
            ci."id" = p."checkInId" AND
            et."checkInId" = ci."id" AND
            et."tagId" = t."id" AND
            mi."entityUuid" = p."uuid"::varchar
        GROUP BY ci."id"
        ORDER BY ci."createdAt" DESC`;

    let queryWithoutPhotos = `
        SELECT ci.*
            FROM "CheckIn" ci, "Post" p, "Tag" t, "EntityTag" et
        WHERE t."value" = '${tag}' AND
            ci."id" = p."checkInId" AND
            et."checkInId" = ci."id" AND
            et."tagId" = t."id"
        GROUP BY ci."id"
        ORDER BY ci."createdAt" DESC`;

    let checkIns = await sequelize.query(queryWithPhotos, { model: CheckIn, mapToModel: true });
    if (checkIns.length === 0) {
      checkIns = await sequelize.query(queryWithoutPhotos, { model: CheckIn, mapToModel: true });
    }

    return checkIns;

  },

  getLatestCheckIns: async (limit, offset, search) => {
    let query = `SELECT DISTINCT "localityUuid", MAX("createdAt") as "lastCreated" FROM "CheckIn"`;
    if (search) {
      query += ` WHERE "locality" ILIKE '%${search}%' OR "country" ILIKE '%${search}%'`;
    }
    query += ` GROUP BY "localityUuid" ORDER BY "lastCreated" DESC, "localityUuid" LIMIT ${limit} OFFSET ${offset}`;
    const latestCheckIns = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return latestCheckIns;
  },

  getLatestCountries: async (limit, offset, search) => {
    let query = `SELECT DISTINCT "country", MAX("createdAt") as "lastCreated" FROM "CheckIn"`;
    if (search) {
      query += ` WHERE "country" ILIKE '%${search}%'`
    }
    query += ` GROUP BY "country" ORDER BY "lastCreated" DESC, "country" LIMIT ${limit} OFFSET ${offset}`;
    const latestCheckIns = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return latestCheckIns;
  },

  getCheckInBefore: async (dateTime, userId) => {

    const checkIn = await CheckIn.findOne({
      where: {
        createdAt: { $lt: dateTime },
        userId
      },
      order: [[ 'createdAt', 'DESC' ]],
      include: {
        all: true
      }
    });

    return checkIn;

  },

  getCheckInAfter: async (dateTime, userId) => {

    const checkIn = await CheckIn.findOne({
      where: {
        createdAt: { $gt: dateTime },
        userId
      },
      order: [[ 'createdAt', 'ASC' ]],
      include: {
        all: true
      }
    });

    return checkIn;

  },

  getLastCheckInWithDeparture: async (dateTime, userId) => {

    let query = `SELECT * FROM "CheckIn" ci
        WHERE "userId" = ${userId} 
        AND "createdAt" < '${dateTime.toISOString()}'
        AND EXISTS(SELECT id FROM "Terminal" WHERE type = 'departure' AND "checkInId" = ci.id)
        ORDER BY "createdAt" DESC LIMIT 1`;

    const checkIns = await sequelize.query(query, { model: CheckIn, mapToModel: true });
    return checkIns.length > 0 ? checkIns[0] : null;

  },

  getTripCheckIns: async (tripId, open, options) => {

    let query = `SELECT ci.* ${open ? getOpenTripQuery(tripId) : getTripQuery(tripId)} ORDER BY ci."createdAt" ASC`;

    if (options) {
      const { offset, limit } = options;
      if (offset) query += ` OFFSET ${offset}`;
      if (limit) query += ` LIMIT ${limit}`;
    }

    const checkIns = await sequelize.query(query, { model: CheckIn, mapToModel: true });
    return checkIns;

  },

  getTripCheckInsWithPhotos: async (tripId) => {

    const queryWithPhotos = `
      SELECT ci.* ${getTripQuery(tripId, true)}
    `;

    const queryWithoutPhotos = `
      SELECT ci.* ${getTripQuery(tripId)}
    `;

    let checkIns = await sequelize.query(queryWithPhotos, { model: CheckIn, mapToModel: true });
    if (checkIns.length === 0) {
      checkIns = await sequelize.query(queryWithoutPhotos, { model: CheckIn, mapToModel: true });
    }
    return checkIns;

  },

  getOpenTripCheckInsWithPhotos: async (tripId) => {

    const queryWithPhotos = `
      SELECT ci.* ${getOpenTripQuery(tripId, true)}
    `;

    const queryWithoutPhotos = `
      SELECT ci.* ${getOpenTripQuery(tripId)}
    `;

    let checkIns = await sequelize.query(queryWithPhotos, { model: CheckIn, mapToModel: true });
    if (checkIns.length === 0) {
      checkIns = await sequelize.query(queryWithoutPhotos, { model: CheckIn, mapToModel: true });
    }
    return checkIns;

  },

};
