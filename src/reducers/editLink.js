import { graphqlReduce } from './utils';
import { navigate } from '../actions/route';
import {
  SELECTED_LOCALITY,
  SET_TRANSPORT,
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
    case SET_TRANSPORT:
      return { ...state, transport: action.payload.transport };
    case LINK_RESET:
      return { ...state, link: null };

  }
  
  return graphqlReduce(
    state, action,
    { 
      start: () => ({ linkInstance: null }), 
      success: () => ({ 
        linkInstance: Object.assign(
          action.payload.linkInstance, 
          { saved: (new Date()).getTime() }
        )
      }), 
      error: () => ({ linkInstance: null })
    },
    SAVE_LINK_START,
    SAVE_LINK_SUCCESS,
    SAVE_LINK_ERROR
  ); 

}
