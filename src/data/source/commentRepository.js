import { getLog } from '../../core/log';
const log = getLog('data/source/commentRepository');

import { Comment, Like, User } from '../models';
import sequelize from '../sequelize';

const getByUuid = async (uuid) => {

  const comment = await Comment.findOne({
    where: { uuid },
    include: { model: User, as: 'user' }
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  return comment;

};

const getIdByUuid = async (uuid) => {
  const comment = await Comment.findOne({ attributes: [ 'id' ], where: { uuid } });
  return comment.id;
};

const getUuidById = async (id) => {
  const comment = await Comment.findOne({ attributes: [ 'uuid' ], where: { id } });
  return comment.uuid;
};

export default {

  getByUuid,
  getIdByUuid,
  getUuidById,

  create: async (comment) => {

    const created = await Comment.create(comment);
    if (!created) {
      throw new Error('failed to create a comment (null result)');
    }

    return created;

  },

  update: async (comment) => {

    const existing = await Comment.findOne({ where: { uuid: comment.uuid } });
    if (!existing) {
      throw new Error('Could not update comment, original comment not found');
    }

    delete comment.uuid;
    await Comment.update(comment, { where: { id: existing.id } });
    return await Comment.findById(existing.id);

  },

  deleteComment: async (commentUuid) => {
    const comment = await Comment.findOne({ where: { uuid: commentUuid } });
    if (!comment) throw new Error(`Could not find Comment uuid=${commentUuid} for deletion.`);
    await comment.destroy();
    return comment;
  },

  getComment: async (where, options) => {

    const comment = await Comment.findOne({
      where,
      include: { model: User, as: 'user' },
      ...options
    });

    return comment;

  },

  getComments: async (where, options) => {

    const comments = await Comment.findAll({
      where,
      include: { model: User, as: 'user' },
      order: [['createdAt', 'DESC']],
      ...options
    });

    return comments;

  },

  saveLike: async (like) => {
    const savedLike = await Like.create(like);
    return savedLike;
  },

  deleteLike: async (userId, entityId, entityType) => {
    const like = await Like.findOne({
      where: {
        userId, entityId, entityType
      }
    });
    await like.destroy();
    return like;
  },

  deleteLikes: async (where) => {
    const deletedLikes = await Like.destroy({
      where
    });
  },

  countLikes: async (where) => {

    let query = `SELECT COUNT(id) FROM "Like" WHERE`;

    const { userId, entityId, entityType } = where;
    const criteria = [];

    if (userId) {
      criteria.push(`"userId" = ${userId}`);
    }

    if (entityId) {
      criteria.push(`"entityId" = ${entityId}`);
    }

    if (entityType) {
      criteria.push(`"entityType" = '${entityType}'`);
    }

    query += ' ' + criteria.join(' AND ');

    const likeCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    return likeCount[0].count;

  }


};
