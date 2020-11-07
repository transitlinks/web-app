import { graphqlAction } from './utils';
import { getTripEntity, getTripCoordEntity, getTripsQuery } from '../data/queries/queries';
import {
  DELETE_TRIP_START,
  DELETE_TRIP_SUCCESS,
  DELETE_TRIP_ERROR,
  GET_TRIPS_ERROR,
  GET_TRIPS_START,
  GET_TRIPS_SUCCESS,
  SAVE_TRIP_ERROR,
  SAVE_TRIP_START,
  SAVE_TRIP_SUCCESS,
  SAVE_TRIP_COORD_ERROR,
  SAVE_TRIP_COORD_START,
  SAVE_TRIP_COORD_SUCCESS,
} from '../constants';
import { getClientId, toGraphQLObject } from '../core/utils';

export const getTrips = (params) => {

  return async (...args) => {

    const query = `
      query {
        ${getTripsQuery(params)}
      }`;

    return graphqlAction(
      ...args,
      { query }, [ 'trips' ],
      GET_TRIPS_START,
      GET_TRIPS_SUCCESS,
      GET_TRIPS_ERROR
    );

  };

};

export const saveTrip = (trip) => {

  return async (...args) => {

    const clientId = getClientId();

    const query = `
      mutation saveTrip {
        trip(trip:${toGraphQLObject(trip)}, clientId:"${clientId}") ${getTripEntity()}
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

};


export const deleteTrip = (uuid) => {

  return async (...args) => {


    const clientId = getClientId();

    const query = `
      mutation deleteTrip {
        deleteTrip(uuid:"${uuid}", clientId:"${clientId}") {
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

};

export const saveTripCoord = (tripCoord) => {

  return async (...args) => {

    const clientId = getClientId();

    const query = `
      mutation saveTripCoord {
        tripCoord(tripCoord:${toGraphQLObject(tripCoord)}, clientId:"${clientId}") ${getTripCoordEntity()}
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'tripCoord' ],
      SAVE_TRIP_COORD_START,
      SAVE_TRIP_COORD_SUCCESS,
      SAVE_TRIP_COORD_ERROR
    );

  };

};
