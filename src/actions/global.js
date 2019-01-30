import {
  GET_GEOLOCATION_START,
  GET_GEOLOCATION_SUCCESS,
  GET_GEOLOCATION_ERROR
} from '../constants';


export function getGeolocation() {

  return async (dispatch) => {

    if (!navigator.geolocation) {

      dispatch({
        type: GET_GEOLOCATION_ERROR,
        payload: 'geolocation_unavailable',
      });

      return true;

    }

    dispatch({
      type: GET_GEOLOCATION_START
    });

    navigator.geolocation.getCurrentPosition((position) => {

      dispatch({
        type: GET_GEOLOCATION_SUCCESS,
        payload: position,
      });

    });

    return true;

  };

}
