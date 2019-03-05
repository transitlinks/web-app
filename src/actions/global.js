import {
  GET_GEOLOCATION_START,
  GET_GEOLOCATION_SUCCESS,
  GET_GEOLOCATION_ERROR
} from '../constants';
import {geocode} from "../services/linkService";


const geocodePosition = async (lat, lng) => {
  return new Promise((resolve, reject) => {
    geocode({ lat, lng }, (location) => {
      resolve(location);
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

    navigator.geolocation.getCurrentPosition(async (position) => {

      console.log("geocode", parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));
      const location = await geocodePosition(parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));
      console.log("LOC", location);
      position.formattedAddress = location.formatted_address || location.address_components.formatted_address;
      dispatch({
        type: GET_GEOLOCATION_SUCCESS,
        payload: position,
      });

    });

    return true;

  };

}
