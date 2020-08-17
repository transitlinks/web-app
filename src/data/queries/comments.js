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
  linkRepository, checkInRepository, terminalRepository,
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

      const { checkInUuid, terminalUuid, text } = comment;
      log.info(`graphql-request=save-comment user=${request.user ? request.user.uuid : null} comment-uuid=${comment.uuid}`);

      if (!request.user) throwMustBeLoggedInError();

      const user = await userRepository.getByUuid(request.user.uuid);

      if (!user) throw new Error('User not found to create a comment. User UUID: ' + request.user.uuid);

      const newComment = {
        userId: user.id,
        text
      };

      let terminal = null;
      if (checkInUuid) {
        const checkIn = await checkInRepository.getCheckIn({ uuid: checkInUuid });
        if (checkIn) newComment.checkInId = checkIn.id;
        else throw new Error('Check-in for comment not found. Uuid: ' + checkInUuid);
      } else if (terminalUuid) {
        terminal = await terminalRepository.getTerminal({ uuid: terminalUuid });
        if (terminal) newComment.terminalId = terminal.id;
      } else {
        throw new Error('No valid entity reference provided for a new comment.');
      }

      const savedComment = await commentRepository.create(newComment);
      return {
        uuid: savedComment.uuid,
        user: user.json(),
        checkInUuid: checkInUuid || (terminal ? terminal.checkInUuid : null),
        terminalUuid,
        text
      };

    }

  }

};
