import { graphqlReduce } from './utils';
import { navigate } from '../actions/route';
import {
  SET_PROPERTY,
  SAVE_TRIP_START,
  SAVE_TRIP_SUCCESS,
  SAVE_TRIP_ERROR,
  DELETE_TRIP_START,
  DELETE_TRIP_SUCCESS,
  DELETE_TRIP_ERROR,
  TRIP_RESET
} from '../constants';

export default function editTrip(state = {}, action) {
  
  const endState = { ...state };

  switch (action.type) {
    
    case SET_PROPERTY:
      endState[action.payload.name] = action.payload.value;
      return endState;
    case TRIP_RESET:
      if (action.payload.trip) {
        
        const { trip } = action.payload;
        
        return { 
          ...state,
          uuid: trip.uuid, 
          name: trip.name
        };

      } else {

        return { 
          ...state, 
          name: null,
        };

      }
  
    case SAVE_TRIP_START:
    case SAVE_TRIP_SUCCESS:
    case SAVE_TRIP_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({ trip: null }), 
          success: () => ({ 
            linkInstance: Object.assign(
              action.payload.trip, 
              { saved: (new Date()).getTime() }
            )
          }), 
          error: () => ({ trip: null })
        },
        SAVE_TRIP_START,
        SAVE_TRIP_SUCCESS,
        SAVE_TRIP_ERROR
      ); 
    
    case DELETE_TRIP_START:
    case DELETE_TRIP_SUCCESS:
    case DELETE_TRIP_ERROR:
      return graphqlReduce(
        state, action,
        { 
          start: () => ({ deleteTrip: null }), 
          success: () => ({ 
            deleteTrip: action.payload.deleteTrip
          }), 
          error: () => ({ deleteTrip: null })
        },
        DELETE_TRIP_START,
        DELETE_TRIP_SUCCESS,
        DELETE_TRIP_ERROR
      );

    default:
      return state;

  }
  

}
