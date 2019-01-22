import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  SELECTED_LOCALITY,
  SELECTED_ADDRESS,
  SET_TRANSPORT,
  SET_PROPERTY,
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  DELETE_CHECKIN_START,
  DELETE_CHECKIN_SUCCESS,
  DELETE_CHECKIN_ERROR,
  CHECKIN_RESET
} from '../constants';

export function selectLocality({ endpoint, locality }) {

  return async (dispatch, getState) => {

    dispatch({
      type: SELECTED_LOCALITY,
      payload: {
        endpoint,
        locality
      },
    });

    return true;

  };

}

export function selectAddress({ endpoint, locality }) {

  return async (dispatch, getState) => {

    dispatch({
      type: SELECTED_ADDRESS,
      payload: {
        endpoint,
        locality
      },
    });

    return true;

  };

}

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

export function setTransport(transport) {

  return async (dispatch) => {

    dispatch({
      type: SET_TRANSPORT,
      payload: {
        transport
      },
    });

    return true;

  };

}

export function resetCheckIn(checkIn) {
  console.log("resetting check-in", checkIn);
  return async (dispatch) => {
    dispatch({
      type: CHECKIN_RESET,
      payload: {
        checkIn
      }
    });
  };
}

export function saveLinkInstance({ checkIn }) {

  return async (...args) => {

    const query = `
      mutation saveLinkInstance {
        checkIn(checkIn:${toGraphQLObject(checkIn)}) {
          uuid,
          privateUuid,
          link {
            uuid,
            from { apiId, name, description, lat, lng },
            to { apiId, name, description, lat, lng }
          },
          transport {
            slug
          }
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'checkIn' ],
      SAVE_CHECKIN_START,
      SAVE_CHECKIN_SUCCESS,
      SAVE_CHECKIN_ERROR
    );

  };

}

export function deleteCheckIn(uuid) {

  return async (...args) => {

    const query = `
      mutation deleteCheckIn {
        deleteCheckIn(uuid:"${uuid}") {
          uuid
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'deleteCheckIn' ],
      DELETE_CHECKIN_START,
      DELETE_CHECKIN_SUCCESS,
      DELETE_CHECKIN_ERROR
    );

  };

}
