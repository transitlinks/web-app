import { graphqlReduce, propToState } from './utils';
import {
  GET_TRIPS_START,
  GET_TRIPS_SUCCESS,
  GET_TRIPS_ERROR,
  GET_ACTIVE_TRIP_START,
  GET_ACTIVE_TRIP_SUCCESS,
  GET_ACTIVE_TRIP_ERROR,
  SAVE_TRIP_START,
  SAVE_TRIP_SUCCESS,
  SAVE_TRIP_ERROR,
  SAVE_TRIP_COORD_START,
  SAVE_TRIP_COORD_SUCCESS,
  SAVE_TRIP_COORD_ERROR,
  DELETE_TRIP_START,
  DELETE_TRIP_SUCCESS,
  DELETE_TRIP_ERROR
} from '../constants';

export default function reduce(state = {}, action) {

  switch (action.type) {

    case GET_TRIPS_START:
    case GET_TRIPS_SUCCESS:
    case GET_TRIPS_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            trips: action.payload.trips
          }),
          error: () => ({ trips: null })
        },
        GET_TRIPS_START,
        GET_TRIPS_SUCCESS,
        GET_TRIPS_ERROR
      );
    case GET_ACTIVE_TRIP_START:
    case GET_ACTIVE_TRIP_SUCCESS:
    case GET_ACTIVE_TRIP_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            activeTrip: action.payload.activeTrip,
            activeTripUpdatedAt: (new Date()).getTime()
          }),
          error: () => ({ activeTrip: null })
        },
        GET_ACTIVE_TRIP_START,
        GET_ACTIVE_TRIP_SUCCESS,
        GET_ACTIVE_TRIP_ERROR
      );
    case SAVE_TRIP_START:
    case SAVE_TRIP_SUCCESS:
    case SAVE_TRIP_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            savedTrip: action.payload.trip
          }),
          error: () => ({ savedTrip: null })
        },
        SAVE_TRIP_START,
        SAVE_TRIP_SUCCESS,
        SAVE_TRIP_ERROR
      );

    case SAVE_TRIP_COORD_START:
    case SAVE_TRIP_COORD_SUCCESS:
    case SAVE_TRIP_COORD_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            savedTripCoord: action.payload.tripCoord
          }),
          error: () => ({ savedTripCoord: null })
        },
        SAVE_TRIP_COORD_START,
        SAVE_TRIP_COORD_SUCCESS,
        SAVE_TRIP_COORD_ERROR
      );

    case DELETE_TRIP_START:
    case DELETE_TRIP_SUCCESS:
    case DELETE_TRIP_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            deletedTrip: action.payload.deleteTrip
          }),
          error: () => ({ deletedTrip: null })
        },
        DELETE_TRIP_START,
        DELETE_TRIP_SUCCESS,
        DELETE_TRIP_ERROR
      );


  }

  return propToState(action, 'trips', { ...state });

}
