import { getLog } from '../../core/log';
const log = getLog('data/source/postRepository');

import Sequelize from 'sequelize';
import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';
import { Post, CheckIn, User } from '../models';

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

  getFeedCheckIns: async (userId) => {

    const checkIns = await CheckIn.findAll({
      order: [
        ['createdAt', 'DESC']
      ]
    });

    return checkIns;

  },

  saveCheckIn: async (checkIn) => {

    console.log("save check in", checkIn.uuid);

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

  }

};
