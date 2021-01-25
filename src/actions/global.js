import {
  GET_GEOLOCATION_START,
  GET_GEOLOCATION_SUCCESS,
  GET_GEOLOCATION_ERROR,
  GET_COORDS_START,
  GET_COORDS_SUCCESS,
  GET_COORDS_ERROR
} from '../constants';
import {geocode} from "../services/linkService";


const geocodePosition = async (lat, lng) => {
  return new Promise((resolve, reject) => {
    geocode({ lat, lng }, (location) => {
      resolve(location.result);
    })
  });
};

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

    console.log('navigator log:');
    console.log('navigator', navigator);
    console.log('navigator.geolocation', navigator.geolocation);
    console.log('getCurrentPosition', navigator.geolocation.getCurrentPosition);
    navigator.geolocation.getCurrentPosition(async (position) => {

      console.log('geocode results:', position);
      console.log('coords:', position.coords);
      console.log('coords lat lng', position.coords.latitude, position.coords.longitude);
      const location = await geocodePosition(parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));
      console.log('geocoded location', location);
      position.formattedAddress = location.formatted_address || location.address_components.formatted_address;
      position.placeId = location.place_id;
      dispatch({
        type: GET_GEOLOCATION_SUCCESS,
        payload: position,
      });

    }, (error) => {
      console.log('navigator.geolocation error', error);
      console.log('navigator.geolocation error code', error.code);
      console.log('navigator.geolocation error message', error.message);
      dispatch({
        type: GET_GEOLOCATION_ERROR,
        payload: 'geolocation_unavailable',
      });
    }, { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 });

    return true;

  };

}

export function getLastCoords() {

  return async (dispatch) => {

    if (!navigator.geolocation) {

      dispatch({
        type: GET_COORDS_ERROR,
        payload: 'geolocation_unavailable',
      });

      return true;

    }

    dispatch({
      type: GET_COORDS_START
    });

    console.log('navigator log:');
    console.log('navigator', navigator);
    console.log('navigator.geolocation', navigator.geolocation);
    console.log('getCurrentPosition', navigator.geolocation.getCurrentPosition);
    navigator.geolocation.getCurrentPosition(async (position) => {

      console.log('geocode results:', position);
      console.log('coords:', position.coords);
      console.log('coords lat lng', position.coords.latitude, position.coords.longitude);
      dispatch({
        type: GET_COORDS_SUCCESS,
        payload: {
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude)
        },
      });

    }, (error) => {
      console.log('navigator.geolocation error', error);
      console.log('navigator.geolocation error code', error.code);
      console.log('navigator.geolocation error message', error.message);
    }, { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 });

    return true;

  };

}
