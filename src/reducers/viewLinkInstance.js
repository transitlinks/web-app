import { graphqlReduce } from './utils';
import {
  SAVE_RATING_START,
  SAVE_RATING_SUCCESS,
  SAVE_RATING_ERROR,
  VOTE_START,
  VOTE_SUCCESS,
  VOTE_ERROR
} from '../constants';

export default (state = null, action) => {
  
  const endState = { ...state };

  switch (action.type) {
    
    case SAVE_RATING_START:
    case SAVE_RATING_SUCCESS:
    case SAVE_RATING_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({ rating: null }), 
          success: () => ({ 
            rating: action.payload.rating
          }), 
          error: () => ({ rating: null })
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
          start: () => ({ votes: null }), 
          success: () => ({ 
            votes: action.payload.votes
          }), 
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
