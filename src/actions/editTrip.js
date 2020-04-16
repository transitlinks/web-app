import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
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

export function setProperty(name, value) {

  return async (dispatch) => {

    dispatch({
      type: SET_PROPERTY,
      payload: {
        name,
        value
      },
    });

    return true;

  };

}

export function saveTrip({ trip }) {

  return async (...args) => {

    const query = `
      mutation saveTrip {
        trip(trip:${toGraphQLObject(trip)}) {
          uuid,
          name
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'trip' ],
      SAVE_TRIP_START,
      SAVE_TRIP_SUCCESS,
      SAVE_TRIP_ERROR
    );

  };

}

export function deleteTrip(uuid) {

  return async (...args) => {

    const query = `
      mutation deleteTrip {
        deleteTrip(uuid:"${uuid}") {
          uuid
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'deleteTrip' ],
      DELETE_TRIP_START,
      DELETE_TRIP_SUCCESS,
      DELETE_TRIP_ERROR
    );

  };

}
