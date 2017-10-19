import { getLog } from '../../core/log';
const log = getLog('data/queries/comments');

import { GraphQLString, GraphQLList } from 'graphql';
import { CommentType, CommentInputType } from '../types/CommentType';
import { 
  commentRepository, 
  userRepository,
  linkRepository
} from '../source';
import { requireOwnership } from './utils';

export const CommentQueryFields = {
  
  comments: {
    
    type: new GraphQLList(CommentType),
    description: 'Comments to a link instance', 
    args: {
      linkInstanceUuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { linkInstanceUuid }) => {
      log.info(`graphql-request=get-comments user=${request.user ? request.user.uuid : null} linkInstanceUuid=${linkInstanceUuid}`);
      return await commentRepository.getByLinkInstanceUuid(linkInstanceUuid);
    }

  }

};

export const CommentMutationFields = {
  
  comment: {
    
    type: CommentType,
    description: 'Update or create a comment',
    args: {
      comment: { type: CommentInputType }
    },
    resolve: async ({ request }, { comment }) => {
      
      const { linkInstanceUuid } = comment;
      delete comment.linkInstanceUuid;
      log.info(`graphql-request=save-comment user=${request.user ? request.user.uuid : null} comment-uuid=${comment.uuid} linkInstanceUuid=${linkInstanceUuid}`);
        
      if (comment.uuid) {
        
        let userUuid = null; 
        const existing = commentRepository.getByUuid(comment.uuid);
        if (comment.userId) {
          const user = userRepository.getById(comment.userId);
          userUuid = user.uuid;
        }
         
        requireOwnership(request, userUuid);

        const updated = await commentRepository.update(comment);
        return { ...updated, linkInstanceUuid };
        
      } else {
        
        if (request.user) {
          const user = await userRepository.getByUuid(request.user.uuid);
          comment.userId = user.id;
        }

        const linkInstanceId = await linkRepository.getInstanceIdByUuid(linkInstanceUuid);
        comment.linkInstanceId = linkInstanceId;
        const created = await commentRepository.create(comment);
        log.info(`graphql-request=save-comment created-comment-uuid=${created.uuid}`);
        return { ...created, linkInstanceUuid };

      }
 
    }
  
  }

};
