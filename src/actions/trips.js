import { graphqlAction } from './utils';
import { getTripEntity, getTripsQuery } from '../data/queries/queries';
import {
  GET_TRIPS_ERROR,
  GET_TRIPS_START,
  GET_TRIPS_SUCCESS,
  SAVE_TRIP_ERROR,
  SAVE_TRIP_START,
  SAVE_TRIP_SUCCESS,
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
