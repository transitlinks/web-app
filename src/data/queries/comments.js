import { getLog } from '../../core/log';
const log = getLog('data/queries/comments');

import { GraphQLString, GraphQLList } from 'graphql';
import {
  CommentType,
  CommentInputType,
  CommentVoteType,
  CommentVoteInputType,
  LikeResultType
} from '../types/CommentType';
import {
  commentRepository,
  userRepository,
  linkRepository, checkInRepository,
} from '../source';
import {
  requireOwnership, throwMustBeLoggedInError,
} from './utils';

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

  like: {

    type: LikeResultType,
    description: 'Add or remove a like',
    args: {
      entityUuid: { type: GraphQLString },
      entityType: { type: GraphQLString },
      onOff: { type: GraphQLString }
    },
    resolve: async ({ request }, { entityUuid, entityType, onOff }) => {

      log.info(`graphql-request=save-like user=${request.user ? request.user.uuid : null} entityUuid=${entityUuid} entityType=${entityType} onOff=${onOff}`);

      if (!request.user) throwMustBeLoggedInError();

      if (entityType === 'CheckIn') {

        const checkIn = await checkInRepository.getCheckIn({ uuid: entityUuid });
        if (!checkIn) throw new Error(`${entityType} not found by uuid ${entityUuid}`);

        const userId = await userRepository.getUserIdByUuid(request.user.uuid);

        if (checkIn && userId) {
          if (onOff === 'on') {
            await commentRepository.saveLike({
              userId,
              entityId: checkIn.id,
              entityType
            });
          } else if (onOff === 'off') {
            await commentRepository.deleteLike(userId, checkIn.id, entityType);
          }
        }

        const likes = await commentRepository.countLikes({
          entityId: checkIn.id,
          entityType
        });

        return {
          likes,
          entityUuid,
          entityType,
          onOff
        };

      }

      throw new Error('Unsupported entity type for like operation');

    }

  },

  comment: {

    type: CommentType,
    description: 'Update or create a comment',
    args: {
      comment: { type: CommentInputType }
    },
    resolve: async ({ request }, { comment }) => {

      const { entity, entityUuid } = comment;
      log.info(`graphql-request=save-comment user=${request.user ? request.user.uuid : null} comment-uuid=${comment.uuid} entity=${entity} entityUuid=${entityUuid}`);

      return {};

    }

  }

};
