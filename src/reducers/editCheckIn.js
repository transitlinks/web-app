import { graphqlReduce, propToState } from './utils';
import { navigate } from '../actions/route';
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

const formatTime = (hour, minute) => {

  let time = '';

  if (hour) {
    time += ((hour < 10 ? '0' : '') + hour);
  } else {
    time += '00';
  }

  if (minute) {
    time += ':' + ((minute < 10 ? '0' : '') + minute);
  } else {
    time += ':00';
  }

  return time;

};

export default function editLink(state = {}, action) {

  const endState = { ...state };

  switch (action.type) {

    case SELECTED_LOCALITY:
      endState[action.payload.endpoint] = action.payload.locality;
      return endState;
    case SELECTED_ADDRESS:
      endState[action.payload.endpoint] = action.payload.locality;
      return endState;
    case SET_TRANSPORT:
      return { ...state, transport: action.payload.transport };
    case SET_PROPERTY:
      endState[action.payload.name] = action.payload.value;
      return endState;
    case CHECKIN_RESET:
      if (action.payload.checkIn && action.payload.checkIn.link) {

        const { checkIn } = action.payload;
        const { link } = checkIn;

        let departureDate = null;
        if (checkIn.departureDate) {
          departureDate = new Date(checkIn.departureDate);
          departureDate.setHours(checkIn.departureHour || 0);
          departureDate.setMinutes(checkIn.departureMinute || 0);
        }

        let arrivalDate = null;
        if (checkIn.arrivalDate) {
          arrivalDate = new Date(checkIn.arrivalDate);
          arrivalDate.setHours(checkIn.arrivalHour || 0);
          arrivalDate.setMinutes(checkIn.arrivalMinute || 0);
        }

        return {
          ...state,
          uuid: checkIn.uuid,
          from: link.from,
          to: link.to,
          transport: checkIn.transport.slug,
          identifier: checkIn.identifier,
          mode: checkIn.mode,
          departureDate: departureDate, departureTime: departureDate,
          departureDescription: checkIn.departureDescription,
          departureAddress: checkIn.departureAddress,
          departureLat: checkIn.departureLat,
          departureLng: checkIn.departureLng,
          availabilityRating: checkIn.availabilityRating,
          departureRating: checkIn.departureRating,
          arrivalRating: checkIn.arrivalRating,
          awesomeRating: checkIn.awesomeRating,
          arrivalDate: arrivalDate, arrivalTime: arrivalDate,
          arrivalDescription: checkIn.arrivalDescription || '',
          arrivalAddress: checkIn.arrivalAddress,
          arrivalLat: checkIn.arrivalLat,
          arrivalLng: checkIn.arrivalLng,
          priceAmount: checkIn.priceAmount || '', priceCurrency: checkIn.priceCurrency,
          description: checkIn.description || ''
        };

      } else {

        return {
          ...state,
          mode: 'research',
          to: null, from: null,
          transport: null, identifier: '',
          departureDate: null, departureTime: null, departureDescription: '',
          departureAddress: '', departureLat: null, departureLng: null,
          arrivalDate: null, arrivalTime: null, arrivalDescription: '',
          arrivalAddress: '', arrivalLat: null, arrivalLng: null,
          priceAmount: '', priceCurrency: null,
          description: '',
          availabilityRating: null, departureRating: null, arrivalRating: null, awesomeRating: null
        };

      }

    case SAVE_CHECKIN_START:
    case SAVE_CHECKIN_SUCCESS:
    case SAVE_CHECKIN_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({ checkIn: null }),
          success: () => ({
            checkIn: Object.assign(
              action.payload.checkIn,
              { saved: (new Date()).getTime() }
            )
          }),
          error: () => ({ checkIn: null })
        },
        SAVE_CHECKIN_START,
        SAVE_CHECKIN_SUCCESS,
        SAVE_CHECKIN_ERROR
      );

    case DELETE_CHECKIN_START:
    case DELETE_CHECKIN_SUCCESS:
    case DELETE_CHECKIN_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({ deleteLinkInstance: null }),
          success: () => ({
            deleteLinkInstance: action.payload.deleteLinkInstance
          }),
          error: () => ({ deleteLinkInstance: null })
        },
        DELETE_CHECKIN_START,
        DELETE_CHECKIN_SUCCESS,
        DELETE_CHECKIN_ERROR
      );

  }

  return propToState(action, 'editCheckIn', { ...state });


}
