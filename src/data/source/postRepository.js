import { getLog } from '../../core/log';
const log = getLog('data/source/postRepository');

import Sequelize from 'sequelize';
import fetch from '../../core/fetch';
import { PLACES_API_URL, PLACES_API_KEY } from '../../config';
import { Post, CheckIn, User } from '../models';

export default {
  
  getPostByUuid: async (uuid) => {
    
		let post = await Post.findOne({
      where: { uuid },
      include: [ { all: true } ] 
    });
    
		if (post === null) {
			return null;
		}
    
    return post.toJSON();
	  	
	},

  getPostsByUserUuid: async (uuid) => {

    const user = await User.findOne( { where: { uuid }});
    const posts = await Post.findAll({ where: { userId: user.id }});

    return posts.map(post => post.toJSON());

  },

  getPostsByCheckInUuid: async (uuid) => {

    const checkIn = await CheckIn.findOne( { where: { uuid }});
    const posts = await Post.findAll({ where: { checkInId: checkIn.id }});

    return posts.map(post => post.toJSON());

  },

  getCheckInsByUserUuid: async (uuid) => {

    const user = await User.findOne( { where: { uuid }});
    const checkIns = await CheckIn.findAll({ where: { userId: user.id }});

    return checkIns.map(post => checkIn.toJSON());

  },
  
	savePost: async (post) => {

    if (post.uuid) {

      const result = await Post.update(post, {
        where: { uuid: post.uuid }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid post update result: ${result}`);
      }

      return await this.getPostByUuid(post.uuid);

    }

    const created = await Post.create(post);
    
    if (!created) {
      throw new Error('Failed to create a post (null result)');
    }

    return created.toJSON();

  },

  createCheckIn: async (checkIn) => {

    if (checkIn.uuid) {

      const result = await CheckIn.update(checkIn, {
        where: { uuid: checkIn.uuid }
      });

      if (result.length !== 1 || result[0] !== 1) {
        throw new Error(`Invalid check-in update result: ${result}`);
      }

      return await this.getPostByUuid(checkIn.uuid);

    }

    const created = await CheckIn.create(checkIn);

    if (!created) {
      throw new Error('Failed to create a check-in (null result)');
    }

    return created.toJSON();

  },
  
  deletePost: async (uuid) => {
    
    let post = await Post.findOne({ where: { uuid }});
    
    if (!post) {
      throw new Error('Could not find post with uuid ' + uuid);
    }

    await post.destroy();
    return post;

  }

};
