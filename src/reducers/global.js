import {
  GET_GEOLOCATION_START,
  GET_GEOLOCATION_SUCCESS,
  GET_GEOLOCATION_ERROR
} from '../constants';

export default function global(state = {}, action) {

  const endState = { ...state };

  switch (action.type) {

    case GET_GEOLOCATION_START:
      endState['geolocation.status'] = 'locating';
      return endState;
    case GET_GEOLOCATION_SUCCESS:
      endState['geolocation.status'] = 'located';
      endState['geolocation.position'] = action.payload;
      return endState;
    case GET_GEOLOCATION_ERROR:
      endState['geolocation.status'] = 'error';
      endState['geolocation.error'] = action.payload;
      return endState;
    default:
      return state;

  }

}
