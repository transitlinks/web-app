import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  VOTE_START,
  VOTE_SUCCESS,
  VOTE_ERROR,
  SAVE_RATING_START,
  SAVE_RATING_SUCCESS,
  SAVE_RATING_ERROR
} from '../constants';

export const saveRating = (rating) => {
  
  return async (...args) => {
    
    const query = `
      mutation saveRating {
        rating(rating:${toGraphQLObject(rating)}) {
          linkInstanceUuid,
          property,
          rating
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


export const vote = (linkInstanceUuid, value) => {
  
  return async (...args) => {
    
    const query = `
      mutation saveVote {
        vote(linkInstanceUuid: "${linkInstanceUuid}", value: ${value}) {
          linkInstanceUuid,
          votes
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
