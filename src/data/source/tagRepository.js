import { getLog } from '../../core/log';
const log = getLog('data/source/tagRepository');

import sequelize from '../sequelize';
import { CheckIn, EntityTag, Tag, User } from '../models';

export default {

  getTags: async (where, options = {}) => {

    const tags = await Tag.findAll({
      where,
      ...options
      //include: [ { all: true } ]
    });

    return tags;

  }

};
