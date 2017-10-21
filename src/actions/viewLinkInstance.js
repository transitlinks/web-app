import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  VOTE_START,
  VOTE_SUCCESS,
  VOTE_ERROR,
  SAVE_RATING_START,
  SAVE_RATING_SUCCESS,
  SAVE_RATING_ERROR,
  SAVE_COMMENT_START,
  SAVE_COMMENT_SUCCESS,
  SAVE_COMMENT_ERROR,
  GET_COMMENTS_START,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_ERROR,
  COMMENT_VOTE_START,
  COMMENT_VOTE_SUCCESS,
  COMMENT_VOTE_ERROR,
  INSTANCE_FILE_UPLOAD_START,
  INSTANCE_FILE_UPLOAD_SUCCESS,
  INSTANCE_FILE_UPLOAD_ERROR,
  SEARCH_MEDIA_START,
  SEARCH_MEDIA_SUCCESS,
  SEARCH_MEDIA_ERROR
} from '../constants';

export const saveRating = (rating) => {
  
  return async (...args) => {
    
    const query = `
      mutation saveRating {
        rating(rating:${toGraphQLObject(rating)}) {
          userUuid,
          linkInstanceUuid,
          avgRating,
          avgAvailabilityRating,
          avgDepartureRating,
          avgArrivalRating,
          avgAwesomeRating,
          userAvailabilityRating,
          userDepartureRating,
          userArrivalRating,
          userAwesomeRating
        }
      }
    `;
    
    return graphqlAction(
      ...args, 
      { query }, [ 'rating' ],
      SAVE_RATING_START,
      SAVE_RATING_SUCCESS,
      SAVE_RATING_ERROR
    );
  
  };

};

export const saveComment = (comment) => {
  
  return async (...args) => {
    
    const query = `
      mutation saveComment {
        comment(comment:${toGraphQLObject(comment)}) {
          uuid,
          text,
          linkInstanceUuid,
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
      { query }, [ 'comment' ],
      SAVE_COMMENT_START,
      SAVE_COMMENT_SUCCESS,
      SAVE_COMMENT_ERROR
    );
  
  };

};

export const voteComment = (commentVote) => {
  
  return async (...args) => {
    
    const query = `
      mutation voteComment {
        commentVote(commentVote:${toGraphQLObject(commentVote)}) {
          uuid,
          up, down
        }
      }
    `;
    
    return graphqlAction(
      ...args, 
      { query }, [ 'commentVote' ],
      COMMENT_VOTE_START,
      COMMENT_VOTE_SUCCESS,
      COMMENT_VOTE_ERROR
    );
  
  };

};

export const getComments = (linkInstanceUuid) => {
  
  return async (...args) => {
    
    const query = `
      query getComments {
        comments(linkInstanceUuid: "${linkInstanceUuid}") {
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


export const vote = (linkInstanceUuid, voteType) => {
  
  return async (...args) => {
    
    const query = `
      mutation saveVote {
        votes(uuid: "${linkInstanceUuid}", voteType: "${voteType}") {
          linkInstanceUuid,
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

export const uploadFiles = (linkInstanceUuid, files) => {
  
  return async (...args) => {
  
    const query = `
      mutation uploadInstanceFiles {
        instanceFiles(linkInstanceUuid: "${linkInstanceUuid}") {
          uuid,
          type,
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

export const getMediaItems = (linkInstanceUuid) => {
  
  return async (...args) => {
  
    const query = `
      query {
        linkInstanceMedia (linkInstanceUuid: "${linkInstanceUuid}") {
          uuid,
          type,
          url
        }
      }
    `;
  
    return graphqlAction(
      ...args, 
      { query }, [ 'linkInstanceMedia' ],
      SEARCH_MEDIA_START,
      SEARCH_MEDIA_SUCCESS,
      SEARCH_MEDIA_ERROR
    );
  
  };

};
