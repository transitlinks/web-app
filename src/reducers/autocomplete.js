import { graphqlReduce } from './utils';
import {
  SET_PROPERTY,
  SELECTED_LOCALITY,
  AUTOCOMPLETE_PLACES_START,
  AUTOCOMPLETE_PLACES_SUCCESS,
  AUTOCOMPLETE_PLACES_ERROR
} from '../constants';

export default function autocomplete(state = null, action) {

  switch (action.type) {
    case SET_PROPERTY:
      if (action.payload.name === 'localityInput') {
        return { ...state, input: action.payload.value };
      }
    case SELECTED_LOCALITY:
      return { ...state, input: '' };
  }
   
  return graphqlReduce(
    state, action,
    { 
      start: () => ({ localities: [] }), 
      success: () => ({ 
        localities: action.payload.localities
      }), 
      error: () => ({ localities: [] })
    },
    AUTOCOMPLETE_PLACES_START,
    AUTOCOMPLETE_PLACES_SUCCESS,
    AUTOCOMPLETE_PLACES_ERROR
  );
}
