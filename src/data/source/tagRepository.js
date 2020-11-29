import { getLog } from '../../core/log';
const log = getLog('data/source/tagRepository');

import sequelize from '../sequelize';
import {CheckIn, EntityTag, Post, Tag, User} from '../models';

export default {

  saveTag: async (entity, entityId, tagValue, userUuid) => {

    let tag = await Tag.findOne({ where: { value: tagValue } });
    if (!tag) {
      tag = await Tag.create({ value: tagValue });
    }

    if (entity === 'Post') {
      const post = await Post.findById(entityId);
      const checkIn = await CheckIn.findById(post.checkInId);
      const entityTag = await EntityTag.findOne({ where: { checkInId: checkIn.id, tagId: tag.id } });
      if (!entityTag) {
        await EntityTag.create({ checkInId: checkIn.id, tagId: tag.id, userUuid, locality: checkIn.locality, country: checkIn.country });
      } else {
        console.log(entity, entityId, 'already tagged with', tagValue);
      }

    }

  },

  getTags: async (where, options = {}) => {

    const tags = Tag.findAll({
      where,
      ...options,
      include: {
        all: true
      }
    });

    return tags;

  },

  getEntityTags: async (where, options = {}) => {

    const entityTags = await EntityTag.findAll({
      where,
      ...options
      //include: [ { all: true } ]
    });

    return entityTags;

  },

  getEntityTagsByLocality: async (locality) => {

    const entityTags = await EntityTag.findAll({
      where: {
        locality
      },
      ...options
      //include: [ { all: true } ]
    });

    return entityTags;

  },

  getLatestTags: async (limit, offset, search) => {
    let query = `SELECT DISTINCT "value" as "tag", MAX("createdAt") as "lastCreated" FROM (SELECT t.value as "value", et."createdAt" AS "createdAt" FROM "Tag" t, "EntityTag" et WHERE t.id = et."tagId") AS tags`;
    if (search) {
      query += ` WHERE "value" ILIKE '%${search}%'`
    }
    query += ` GROUP BY "value" ORDER BY "lastCreated" DESC, "value" LIMIT ${limit} OFFSET ${offset}`;
    const latestTags = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return latestTags;
  },

  getLatestTagsByLocality: async (locality, limit) => {
    let query = `SELECT "value" as "tag", MAX("createdAt") as "lastCreated", "userUuid" as "userUuid" FROM (SELECT t.value as "value", et."createdAt" AS "createdAt", et."userUuid" AS "userUuid" FROM "Tag" t, "EntityTag" et WHERE t.id = et."tagId" AND et."locality" = '${locality}') AS tags`;
    query += ` GROUP BY "value", "userUuid" ORDER BY "lastCreated" DESC, "value" LIMIT ${limit}`;
    const latestTags = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return latestTags;
  },

  getLatestTagsByCountry: async (country, limit) => {
    let query = `SELECT "value" as "tag", MAX("createdAt") as "lastCreated", "userUuid" as "userUuid" FROM (SELECT t.value as "value", et."createdAt" AS "createdAt", et."userUuid" AS "userUuid" FROM "Tag" t, "EntityTag" et WHERE t.id = et."tagId" AND et."country" = '${country}') AS tags`;
    query += ` GROUP BY "value", "userUuid" ORDER BY "lastCreated" DESC, "value" LIMIT ${limit}`;
    const latestTags = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return latestTags;
  },

  getTagsByCheckInIds: async (checkInIds) => {
    let query = `SELECT t."value" as "tag", et."userUuid" as "userUuid", et.id as "entityTagId" FROM "Tag" t, "EntityTag" et WHERE t."id" = et."tagId" AND et."checkInId" IN (${checkInIds.join(',')})`;
    const tags = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return tags;
  },

  deleteEntityTags: async (where) => {
    await EntityTag.destroy({ where });
    return;
  },

};
