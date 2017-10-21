import { getLog } from '../../core/log';
const log = getLog('data/source/commentRepository');

import { Comment, LinkInstance, User } from '../models';

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
 
  getByLinkInstanceUuid: async (linkInstanceUuid) => {
    
    const linkInstance = await LinkInstance.findOne({ 
      where: { 
        $or: [ 
          { uuid: linkInstanceUuid }, 
          { privateUuid: linkInstanceUuid } 
        ] 
      } 
    });
    
    const comments = await Comment.findAll({ 
      where: { linkInstanceId: linkInstance.id },
      include: { model: User, as: 'user' }
    });
        
    return (comments || []).map(async comment => {
      
      const commentJson = comment.json();
      if (comment.get('replyToId')) {
        commentJson.replyToUuid = await getUuidById(comment.get('replyToId'));
      }

      return commentJson;

    });

  },

  create: async (comment) => {
    
    const created = await Comment.create(comment);
    if (!created) {
      throw new Error('failed to create a comment (null result)');
    }

    return created.json();
  
  },
 
  update: async (comment) => {
    
    const existing = await Comment.findOne({ where: { uuid: comment.uuid } });
    if (!existing) {
      throw new Error('could not update comment, original comment not found');
    }
    
    delete comment.uuid;
    delete comment.linkInstanceUuid;
    await Comment.update(comment, { where: { id: existing.id } });
    return (await Comment.findById(existing.id)).json();
  
  } 

};
