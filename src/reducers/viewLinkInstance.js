import { graphqlReduce } from './utils';
import {
  SAVE_RATING_START,
  SAVE_RATING_SUCCESS,
  SAVE_RATING_ERROR,
  VOTE_START,
  VOTE_SUCCESS,
  VOTE_ERROR
} from '../constants';

export default (state = {}, action) => {
  
  const endState = { ...state };

  switch (action.type) {
    
    case SAVE_RATING_START:
    case SAVE_RATING_SUCCESS:
    case SAVE_RATING_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({}), 
          success: () => ({ 
            ratings: action.payload.rating
          }), 
          error: () => ({ ratings: null })
        },
        SAVE_RATING_START,
        SAVE_RATING_SUCCESS,
        SAVE_RATING_ERROR
      ); 
    case VOTE_START:
    case VOTE_SUCCESS:
    case VOTE_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({}), 
          success: () => {
            const votes = {};
            votes[action.payload.votes.voteType] = action.payload.votes.votesCount;
            return votes;
          }, 
          error: () => ({ votes: null })
        },
        VOTE_START,
        VOTE_SUCCESS,
        VOTE_ERROR
      );
    default:
      return state;
      
  }
  
}
