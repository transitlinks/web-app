import { graphqlReduce } from './utils';
import { navigate } from '../actions/route';
import {
  SELECTED_LOCALITY,
  SAVE_LINK_START,
  SAVE_LINK_SUCCESS,
  SAVE_LINK_ERROR,
  LINK_RESET
} from '../constants';

export default function editLink(state = null, action) {
  
  switch (action.type) {
    
    case SELECTED_LOCALITY:
      const endState = { ...state };
      endState[action.payload.endpoint] = action.payload.locality;
      return endState;    
    case LINK_RESET:
      return { ...state, link: null };

  }
  
  return graphqlReduce(
    state, action,
    { 
      start: () => ({ link: null }), 
      success: () => ({ 
        link: Object.assign(action.payload.link, { saved: (new Date()).getTime() })
      }), 
      error: () => ({ link: null })
    },
    SAVE_LINK_START,
    SAVE_LINK_SUCCESS,
    SAVE_LINK_ERROR
  ); 

}
