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

export default {  
  
  getByUuid,
  
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
    
    const commentsAll = await Comment.findAll();
        
    log.debug("repo=comments comments", comments, commentsAll); 
    return (comments || []).map(comment => comment.json());

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
    if (!exisiting) {
      throw new Error('could not update comment, original comment not found');
    }
    
    await Comment.update({ text: comment.text }, { where: { id: existing.id } });
    return (await Comment.findById(existing.id)).json();
  
  } 

};
