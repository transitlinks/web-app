import { graphqlAction } from './utils';
import {
  AUTOCOMPLETE_PLACES_START,
  AUTOCOMPLETE_PLACES_SUCCESS,
  AUTOCOMPLETE_PLACES_ERROR
} from '../constants';

export const searchLocalities = (input) => {
 
  return async (...args) => {
    
    const query = `
      query {
        localities(input: "${input}", types: "(cities)") {
          apiId,
          description,
          countryLong,
          lat,
          lng
        }
      }
    `;

    return graphqlAction(
      ...args, 
      { query }, [ 'localities' ],
      AUTOCOMPLETE_PLACES_START, 
      AUTOCOMPLETE_PLACES_SUCCESS, 
      AUTOCOMPLETE_PLACES_ERROR
    );
  
  };

};

export const searchAddresses = (input, location) => {
  
  return async (...args) => {
    
    const query = `
      query {
        localities(input:"${input}", location:"${location}", radius: 20000) {
          apiId,
          description,
          countryLong,
          lat,
          lng
        }
      }
    `;

    return graphqlAction(
      ...args, 
      { query }, [ 'localities' ],
      AUTOCOMPLETE_PLACES_START,
      AUTOCOMPLETE_PLACES_SUCCESS, 
      AUTOCOMPLETE_PLACES_ERROR
    );
  
  };

};
