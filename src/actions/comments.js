import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  VOTE_START,
  VOTE_SUCCESS,
  VOTE_ERROR,
  GET_COMMENTS_START,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_ERROR,
  COMMENT_VOTE_START,
  COMMENT_VOTE_SUCCESS,
  COMMENT_VOTE_ERROR,
  INSTANCE_FILE_UPLOAD_START,
  INSTANCE_FILE_UPLOAD_SUCCESS,
  INSTANCE_FILE_UPLOAD_ERROR,
  SAVE_COMMENT_START,
  SAVE_COMMENT_SUCCESS,
  SAVE_COMMENT_ERROR,
  SAVE_LIKE_START,
  SAVE_LIKE_SUCCESS,
  SAVE_LIKE_ERROR
} from '../constants';

export const saveLike = (entityUuid, entityType, onOff, frameId, checkInUuid) => {

  return async (...args) => {

    const query = `
      mutation like {
        like(entityUuid:"${entityUuid}", entityType:"${entityType}", onOff:"${onOff}") {
          likes,
          entityUuid,
          entityType,
          onOff
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query, variables: { frameId, checkInUuid } }, [ 'like' ],
      SAVE_LIKE_START,
      SAVE_LIKE_SUCCESS,
      SAVE_LIKE_ERROR
    );

  };

};

export const saveComment = (comment, frameId) => {

  return async (...args) => {

    const query = `
      mutation saveComment {
        comment(comment:${toGraphQLObject(comment)}) {
          uuid,
          text,
          replyToUuid,
          checkInUuid,
          terminalUuid,
          user {
            uuid,
            username,
            firstName,
            lastName,
            photo
          }
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query, variables: { frameId } }, [ 'comment' ],
      SAVE_COMMENT_START,
      SAVE_COMMENT_SUCCESS,
      SAVE_COMMENT_ERROR
    );

  };

};

export const getComments = (checkInUuid) => {

  return async (...args) => {

    const query = `
      query getComments {
        comments(checkInUuid: "${checkInUuid}") {
          uuid,
          replyToUuid,
          text,
          up, down,
          user {
            uuid,
            username,
            firstName,
            lastName
          }
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'comments' ],
      GET_COMMENTS_START,
      GET_COMMENTS_SUCCESS,
      GET_COMMENTS_ERROR
    );

  };

};


export const vote = (checkInUuid, voteType) => {

  return async (...args) => {

    const query = `
      mutation saveVote {
        votes(uuid: "${checkInUuid}", voteType: "${voteType}") {
          checkInUuid,
          voteType,
          votesCount
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'votes' ],
      VOTE_START,
      VOTE_SUCCESS,
      VOTE_ERROR
    );

  };

};

export const uploadFiles = (checkInUuid, files) => {

  return async (...args) => {

    const query = `
      mutation uploadInstanceFiles {
        instanceFiles(checkInUuid: "${checkInUuid}") {
          uuid,
          type,
          thumbnail,
          url
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query, files }, [ 'instanceFiles' ],
      INSTANCE_FILE_UPLOAD_START,
      INSTANCE_FILE_UPLOAD_SUCCESS,
      INSTANCE_FILE_UPLOAD_ERROR
    );

  };

};
