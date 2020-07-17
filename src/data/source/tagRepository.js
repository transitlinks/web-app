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
        console.log('CREATE ENTITY TAG', checkIn.id, tagValue + '(' + tag.id + ')', userUuid);
        await EntityTag.create({ checkInId: checkIn.id, tagId: tag.id, userUuid, locality: checkIn.locality });
        console.log('Tagged entity', entity, entityId, 'with', tagValue);
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

  }

};
