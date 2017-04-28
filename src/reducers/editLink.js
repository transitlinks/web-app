import { graphqlReduce } from './utils';
import { navigate } from '../actions/route';
import {
  SELECTED_LOCALITY,
  SELECTED_ADDRESS,
  SET_TRANSPORT,
  SET_PROPERTY,
  SAVE_LINK_START,
  SAVE_LINK_SUCCESS,
  SAVE_LINK_ERROR,
  LINK_RESET
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

export default function editLink(state = null, action) {
  
  const endState = { ...state };

  switch (action.type) {
    
    case SELECTED_LOCALITY:
      endState[action.payload.endpoint] = action.payload.locality;
      return endState;    
    case SELECTED_ADDRESS:
      endState[action.payload.endpoint] = action.payload.locality;
      console.log("end state", endState, action);
      return endState;
    case SET_TRANSPORT:
      return { ...state, transport: action.payload.transport };
    case SET_PROPERTY:
      endState[action.payload.name] = action.payload.value;
      return endState;
    case LINK_RESET:
      if (action.payload.linkInstance && action.payload.linkInstance.link) {
        
        const { linkInstance } = action.payload;
        const { link } = linkInstance;
        
        let departureDate = null;
        if (linkInstance.departureDate) {
          departureDate = new Date(linkInstance.departureDate);
          departureDate.setHours(linkInstance.departureHour || 0);
          departureDate.setMinutes(linkInstance.departureMinute || 0);
        }
        
        let arrivalDate = null;        
        if (linkInstance.arrivalDate) {
          arrivalDate = new Date(linkInstance.arrivalDate);
          arrivalDate.setHours(linkInstance.arrivalHour || 0);
          arrivalDate.setMinutes(linkInstance.arrivalMinute || 0);
        }

        return { 
          ...state,
          uuid: linkInstance.uuid, 
          from: link.from, 
          to: link.to,
          transport: linkInstance.transport.slug, 
          identifier: linkInstance.identifier, 
          mode: linkInstance.mode, 
          departureDate: departureDate, departureTime: departureDate, 
          departureDescription: linkInstance.departureDescription,
          departureAddress: linkInstance.departureAddress,
          departureLat: linkInstance.departureLat,
          departureLng: linkInstance.departureLng,
          availabilityRating: linkInstance.availabilityRating,
          departureRating: linkInstance.departureRating,
          arrivalRating: linkInstance.arrivalRating,
          awesomeRating: linkInstance.awesomeRating,
          arrivalDate: arrivalDate, arrivalTime: arrivalDate, 
          arrivalDescription: linkInstance.arrivalDescription || '',
          arrivalAddress: linkInstance.arrivalAddress,
          arrivalLat: linkInstance.arrivalLat,
          arrivalLng: linkInstance.arrivalLng,
          priceAmount: linkInstance.priceAmount || '', priceCurrency: linkInstance.priceCurrency,
          description: linkInstance.description || ''
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

  }
  
  return graphqlReduce(
    state, action,
    { 
      start: () => ({ linkInstance: null }), 
      success: () => ({ 
        linkInstance: Object.assign(
          action.payload.linkInstance, 
          { saved: (new Date()).getTime() }
        )
      }), 
      error: () => ({ linkInstance: null })
    },
    SAVE_LINK_START,
    SAVE_LINK_SUCCESS,
    SAVE_LINK_ERROR
  ); 

}
