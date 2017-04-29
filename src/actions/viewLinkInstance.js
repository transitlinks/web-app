import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  VOTE_START,
  VOTE_SUCCESS,
  VOTE_ERROR,
  SAVE_RATING_START,
  SAVE_RATING_SUCCESS,
  SAVE_RATING_ERROR,
  INSTANCE_FILE_UPLOAD_START,
  INSTANCE_FILE_UPLOAD_SUCCESS,
  INSTANCE_FILE_UPLOAD_ERROR
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

export const uploadFiles = (files) => {
  
  return async (...args) => {
  
    const query = `
      mutation uploadInstanceFiles {
        instanceFiles {
          filesCount
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
