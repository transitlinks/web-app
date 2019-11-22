import { getLog } from '../../core/log';
const log = getLog('data/source/postRepository');

import Sequelize from 'sequelize';
import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';
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
      ...options
    });

    return checkIns;

  },

  getCheckInsByUserUuid: async (uuid) => {

    const user = await User.findOne( { where: { uuid }});
    const checkIns = await CheckIn.findAll({ where: { userId: user.id }});

    return checkIns;

  },

  getFeedCheckIns: async (where, options = {}) => {

    const checkIns = await CheckIn.findAll({
      where,
      ...options
    });

    return checkIns;

  },

  saveCheckIn: async (checkIn) => {

    console.log("save check in", checkIn, checkIn.uuid);

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

    console.log("delete checkins result", deleteResult);
    return deleteResult;

  },

  getCheckInLocalities: async () => {

    const localities = await CheckIn.aggregate('locality', 'DISTINCT', { plain: false });
    //const localities = await CheckIn.findAll({
    //  group: ['id', 'locality']
    //});
    return localities.map(locality => locality.DISTINCT);

  },

  getTags: async (where, options = {}) => {

    const tags = await Tag.findAll({
      where,
      ...options,
      include: [ { all: true } ]
    });

    return tags;

  },

  getTaggedCheckIns: async (tags) => {

    const tagEntities = await Tag.findAll({
      where: { value: { $in: tags } }
    });

    let checkIns = [];
    for (let i = 0; i < tagEntities.length; i++) {
      const tag = tagEntities[i];
      const entityTags = await EntityTag.findAll({ where: { tagId: tag.id }});
      const checkInIds = entityTags.map(entityTag => entityTag.checkInId);
      const taggedCheckIns = await CheckIn.findAll({
        where: { id: { $in: checkInIds } },
        order: [
          ['createdAt', 'DESC']
        ]
      });
      checkIns = checkIns.concat(taggedCheckIns);
    }

    return checkIns;

  },

  deletePosts: async (where, options = {}) => {

    const deleteResult = await Post.destroy({
      where,
      ...options
    });

    console.log("delete posts result", deleteResult);
    return deleteResult;

  },

  deleteTerminals: async (where, options = {}) => {

    const deleteResult = await Terminal.destroy({
      where,
      ...options
    });

    console.log("delete terminals result", deleteResult);
    return deleteResult;

  },

  getMediaItems: async (where, options = {}) => {

    const mediaItems = await MediaItem.findAll({
      where,
      ...options
    });

    return mediaItems;

  },

  saveMediaItem: async (mediaItem) => {

    console.log("save media item", mediaItem.uuid);

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

};
