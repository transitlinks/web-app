import { graphqlReduce } from './utils';
import {
  SET_PROPERTY,
  SAVE_RATING_START,
  SAVE_RATING_SUCCESS,
  SAVE_RATING_ERROR,
  SAVE_COMMENT_START,
  SAVE_COMMENT_SUCCESS,
  SAVE_COMMENT_ERROR,
  GET_COMMENTS_START,
  GET_COMMENTS_SUCCESS,
  GET_COMMENTS_ERROR,
  VOTE_START,
  VOTE_SUCCESS,
  VOTE_ERROR,
  SEARCH_MEDIA_START,
  SEARCH_MEDIA_SUCCESS,
  SEARCH_MEDIA_ERROR,
  INSTANCE_FILE_UPLOAD_START,
  INSTANCE_FILE_UPLOAD_SUCCESS,
  INSTANCE_FILE_UPLOAD_ERROR
} from '../constants';

export default (state = {}, action) => {
  
  const endState = { ...state };

  switch (action.type) {
    
    case SET_PROPERTY:
      endState[action.payload.name] = action.payload.value;
      return endState;
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
    case SAVE_COMMENT_START:
    case SAVE_COMMENT_SUCCESS:
    case SAVE_COMMENT_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({}), 
          success: () => ({ 
            savedComment: action.payload.comment
          }), 
          error: () => ({ comment: null })
        },
        SAVE_COMMENT_START,
        SAVE_COMMENT_SUCCESS,
        SAVE_COMMENT_ERROR
      ); 
    case GET_COMMENTS_START:
    case GET_COMMENTS_SUCCESS:
    case GET_COMMENTS_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({}), 
          success: () => ({ 
            comments: action.payload.comments
          }),
          error: () => ({ comments: null })
        },
        GET_COMMENTS_START,
        GET_COMMENTS_SUCCESS,
        GET_COMMENTS_ERROR,
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

    case SEARCH_MEDIA_START:
    case SEARCH_MEDIA_SUCCESS:
    case SEARCH_MEDIA_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({ linkInstanceMedia: [] }), 
          success: () => ({ linkInstanceMedia: action.payload.mediaItems }), 
          error: () => ({ linkInstanceMedia: [] })
        },
        SEARCH_MEDIA_START,
        SEARCH_MEDIA_SUCCESS,
        SEARCH_MEDIA_ERROR
      );
    case INSTANCE_FILE_UPLOAD_SUCCESS:
      if (!endState.addedMedia) {
        endState.addedMedia = [];
      }
      endState.addedMedia.push(action.payload.instanceFiles);
      endState.mediaDialogOpen = false;
      return endState;
    
    default:
      return state;
      
  }
  
}
