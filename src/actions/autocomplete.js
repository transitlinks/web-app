import { graphqlAction } from './utils';
import {
  AUTOCOMPLETE_PLACES_START,
  AUTOCOMPLETE_PLACES_SUCCESS,
  AUTOCOMPLETE_PLACES_ERROR
} from '../constants';

export function autocomplete(input) {
  
  return async (...args) => {
    
    const query = `
      query {
        localities(input:"${input}") {
          id,
          name,
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

}
