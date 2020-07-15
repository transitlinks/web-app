import { getLog } from '../../core/log';
const log = getLog('data/source/checkInRepository');

import sequelize from '../sequelize';
import { CheckIn, EntityTag, Tag, User } from '../models';

export default {

  getCheckIn: async (where, options = {}) => {

    const checkIn = await CheckIn.findOne({
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

    return deleteResult;

  },

  getCheckInCount: async (locality) => {
    const query = `SELECT COUNT(id) FROM "CheckIn" WHERE locality = '${locality}'`;
    const checkInCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return checkInCount[0].count;
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

    console.log('query tagged checkins', where, options);
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

  }

};
