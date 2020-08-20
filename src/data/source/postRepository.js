import { getLog } from '../../core/log';
const log = getLog('data/source/postRepository');

import sequelize from '../sequelize';
import { Post, Terminal, CheckIn, User, MediaItem, Tag, EntityTag } from '../models';

export default {

  getPost: async (where, options) => {

		let post = await Post.findOne({
      where,
      include: [ { all: true } ]
    });

		return post;

	},


  getPosts: async (where, options) => {

    let posts = await Post.findAll({
      where,
      include: [ { all: true } ]
    });

    return posts;

  },

  getPostsByUserUuid: async (uuid) => {

    const user = await User.findOne( { where: { uuid }});
    const posts = await Post.findAll({ where: { userId: user.id }});

    return posts;

  },

  getPostsByCheckInUuid: async (uuid) => {

    const checkIn = await CheckIn.findOne( { where: { uuid }});
    const posts = await Post.findAll({ where: { checkInId: checkIn.id }});

    return posts;

  },

  getFeedPosts: async (userId) => {

    const posts = await Post.findAll();
    return posts;

  },

  savePost: async (post) => {

    if (post.uuid) {

      const result = await Post.update(post, {
        where: { uuid: post.uuid }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid post update result: ${result}`);
      }

      return await Post.findOne({ where: { uuid: post.uuid }});

    }

    const created = await Post.create(post);

    if (!created) {
      throw new Error('Failed to create a post (null result)');
    }

    return created;

  },


  deletePost: async (uuid) => {

    let post = await Post.findOne({ where: { uuid }});

    if (!post) {
      throw new Error('Could not find post with uuid ' + uuid);
    }

    await post.destroy();
    return post;

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
      include: [ { all: true } ]
    });

    return terminals;

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

  getCheckIn: async (where, options = {}) => {

    let checkIn = await CheckIn.findOne({
      where,
      ...options
      //include: [ { all: true } ]
    });

    return checkIn;

  },

  getCheckIns: async (where, options = {}) => {

    const checkIns = await CheckIn.findAll({
      where,
      ...options,
      include: { all: true }
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

  saveCheckIn: async (checkIn) => {

    if (checkIn.uuid) {

      const result = await CheckIn.update(checkIn, {
        where: { uuid: checkIn.uuid }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid check-in update result: ${result}`);
      }

      return await CheckIn.findOne({ where:{ uuid: checkIn.uuid }});

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

  getCheckInCount: async (locality) => {
    const query = `SELECT COUNT(id) FROM "CheckIn" WHERE locality = '${locality}'`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
  },

  getPostsByLocality: async (locality, limit) => {
    let query = `SELECT * FROM "Post" p WHERE "checkInId" IN (SELECT id FROM "CheckIn" WHERE locality = '${locality}') AND (SELECT COUNT(id) FROM "MediaItem" mi WHERE mi."type" = 'image' AND p."uuid"::varchar = mi."entityUuid") > 0 ORDER BY "createdAt" DESC`;
    if (limit) query += ' LIMIT ' + limit;
    const posts = await sequelize.query(query, { model: Post, mapToModel: true });
    return posts;
  },

  getPostCountByLocality: async (locality) => {
    let query = `SELECT COUNT(id) FROM "Post" p WHERE "checkInId" IN (SELECT id FROM "CheckIn" WHERE locality = '${locality}')`;
    const postCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return postCount[0].count;
  },

  getPostsByTag: async (tag, limit) => {
    let query = `SELECT * FROM "Post" p WHERE "checkInId" IN (SELECT et."checkInId" FROM "EntityTag" et, "Tag" t WHERE et."tagId" = t.id AND t.value = '${tag}') AND (SELECT COUNT(id) FROM "MediaItem" mi WHERE mi."type" = 'image' AND p."uuid"::varchar = mi."entityUuid") > 0 ORDER BY "createdAt" DESC`;
    if (limit) query += ' LIMIT ' + limit;
    const posts = await sequelize.query(query, { model: Post, mapToModel: true });
    return posts;
  },

  getPostCountByTag: async (tag) => {
    let query = `SELECT COUNT(id) FROM "Post" p WHERE "checkInId" IN (SELECT et."checkInId" FROM "EntityTag" et, "Tag" t WHERE et."tagId" = t.id AND t.value = '${tag}')`;
    const postCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return postCount[0].count;
  },

  getConnectionsByLocality: async(locality, type) => {
    const query = `SELECT DISTINCT ci1.locality FROM "Terminal" as t1, "CheckIn" as ci1 WHERE  t1."checkInId" = ci1.id AND t1."linkedTerminalId" IN (SELECT t2.id FROM "CheckIn" as ci2, "Terminal" as t2 WHERE ci2.locality = '${locality}' AND ci2.id = t2."checkInId" AND t2.type = '${type}')`;
    const connections = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return connections.map(c => c.locality);
  },

  getTaggedCheckIns: async (query, options) => {

    const { tags, userId } = query;
    const valueTags = await Tag.findAll({
      where: { value: { $in: tags } }
    });

    const valueTagIds = valueTags.map(tag => tag.id);
    const entityTags = await EntityTag.findAll({ where: { tagId: { $in: valueTagIds } } });
    const checkInIds = entityTags.map(entityTag => entityTag.checkInId);
    const where = { id: { $in: checkInIds } };
    if (userId) where.userId = userId;
    const taggedCheckIns = await CheckIn.findAll({
      where,
      ...options,
      include: {
        all: true
      }
    });

    return taggedCheckIns;

    /*
    let checkIns = [];
    for (let i = 0; i < tagEntities.length; i++) {
      const tag = tagEntities[i];
      const entityTags = await EntityTag.findAll({ where: { tagId: tag.id }});
      const checkInIds = entityTags.map(entityTag => entityTag.checkInId);
      const taggedCheckIns = await CheckIn.findAll({
        where: { id: { $in: checkInIds } },
        ...options
      });
      checkIns = checkIns.concat(taggedCheckIns);
    }

    return checkIns;
    */

  },

  deletePosts: async (where, options = {}) => {

    const deleteResult = await Post.destroy({
      where,
      ...options
    });

    return deleteResult;

  },

  deleteTerminals: async (where, options = {}) => {

    const deleteResult = await Terminal.destroy({
      where,
      ...options
    });

    return deleteResult;

  },

  getMediaItems: async (where, options = {}) => {

    const mediaItems = await MediaItem.findAll({
      where,
      ...options
    });

    return mediaItems;

  },

  getMediaItem: async (where, options = {}) => {

    const mediaItem = await MediaItem.findOne({
      where,
      ...options
    });

    return mediaItem;

  },

  saveMediaItem: async (mediaItem) => {

    if (mediaItem.uuid) {

      const result = await MediaItem.update(mediaItem, {
        where: { uuid: mediaItem.uuid }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid media item update result: ${result}`);
      }

      return await MediaItem.findOne({ where:{ uuid: mediaItem.uuid }});

    }

    const created = await MediaItem.create(mediaItem);

    if (!created) {
      throw new Error('Failed to create a media item (null result)');
    }

    return created;

  },

  deleteMediaItems: async (where, options = {}) => {

    const deleteResult = await MediaItem.destroy({
      where,
      ...options
    });

    return deleteResult;

  }

};
