import { getLog, graphLog } from '../../core/log';
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
import { PostType } from '../types/PostType';
import { getComments } from '../../actions/comments';

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

const deleteComment = async (uuid) => {

  const comment = await commentRepository.getComment({ uuid });
  if (!comment) throw new Error(`Could not find Comment uuid=${uuid} for deletion.`);

  const deleteReplys = async (comment) => {
    const replys = await commentRepository.getComments({ replyToId: comment.id });
    for (let i = 0; i < replys.length; i++) {
      await deleteReplys(replys[i]);
    }
    await commentRepository.deleteLikes({ entityType: 'Comment', entityId: comment.id });
    await commentRepository.deleteComment(comment.uuid);
  };

  await deleteReplys(comment);

  return comment;

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

      let entity = null;
      if (entityType === 'CheckIn') {
        entity = await checkInRepository.getCheckIn({ uuid: entityUuid });
      } else if (entityType === 'Comment') {
        entity = await commentRepository.getComment({ uuid: entityUuid });
      } else {
        throw new Error('Unsupported entity type for like operation');
      }

      if (!entity) throw new Error(`${entityType} not found by uuid ${entityUuid}`);

      const userId = await userRepository.getUserIdByUuid(request.user.uuid);

      if (entity && userId) {
        if (onOff === 'on') {
          await commentRepository.saveLike({
            userId,
            entityId: entity.id,
            entityType
          });
        } else if (onOff === 'off') {
          await commentRepository.deleteLike(userId, entity.id, entityType);
        }
      }

      const likes = await commentRepository.countLikes({
        entityId: entity.id,
        entityType
      });

      return {
        likes,
        entityUuid,
        entityType,
        onOff
      };

    }

  },

  comment: {

    type: CommentType,
    description: 'Update or create a comment',
    args: {
      comment: { type: CommentInputType }
    },
    resolve: async ({ request }, { comment }) => {

      const { checkInUuid, terminalUuid, replyToUuid, text } = comment;
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

      if (replyToUuid) {
        const replyTo = await commentRepository.getComment({ uuid: replyToUuid });
        if (replyTo) {
          newComment.replyToId = replyTo.id;
          newComment.replyToUuid = replyToUuid;
        }
      }

      const savedComment = await commentRepository.create(newComment);
      return {
        uuid: savedComment.uuid,
        user: user.json(),
        checkInUuid: checkInUuid || (terminal ? terminal.checkInUuid : null),
        terminalUuid,
        replyToUuid,
        text
      };

    }

  },

  deleteComment: {

    type: CommentType,
    description: 'Delete a comment',
    args: {
      uuid: { type: GraphQLString },
      clientId: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid, clientId }) => {

      log.info(graphLog(request, 'delete-comment', 'clientId=' + clientId + ' uuid=' + uuid));
      const deletedComment = await deleteComment(uuid);
      return deletedComment.json();

    }

  },

};
