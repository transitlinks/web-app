import { graphqlReduce } from './utils';
import { navigate } from '../actions/route';
import {
  SELECTED_LOCALITY,
  SET_TRANSPORT,
  SET_PROPERTY,
  SAVE_LINK_START,
  SAVE_LINK_SUCCESS,
  SAVE_LINK_ERROR,
  LINK_RESET
} from '../constants';

export default function editLink(state = null, action) {
  
  const endState = { ...state };

  switch (action.type) {
    
    case SELECTED_LOCALITY:
      endState[action.payload.endpoint] = action.payload.locality;
      return endState;    
    case SET_TRANSPORT:
      return { ...state, transport: action.payload.transport };
    case SET_PROPERTY:
      endState[action.payload.name] = action.payload.value;
      return endState;
    case LINK_RESET:
      return { 
        ...state, 
        to: null, from: null, 
        transport: null, 
        departureDate: null, departureTime: null, departurePlace: '',
        arrivalDate: null, arrivalTime: null, arrivalPlace: '',
        priceAmount: '', priceCurrency: null,
        description: '',
        availabilityRating: null, departureRating: null, arrivalRating: null, awesomeRating: null
      };

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
