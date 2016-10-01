import { graphqlReduce } from './utils';
import {
  AUTOCOMPLETE_PLACES_START,
  AUTOCOMPLETE_PLACES_SUCCESS,
  AUTOCOMPLETE_PLACES_ERROR
} from '../constants';

export default function autocomplete(state = null, action) {
  return graphqlReduce(
    state, action,
    { 
      start: () => ({ localities: [] }), 
      success: () => ({ localities: action.payload.localities }), 
      error: () => ({ localities: [] })
    },
    AUTOCOMPLETE_PLACES_START,
    AUTOCOMPLETE_PLACES_SUCCESS,
    AUTOCOMPLETE_PLACES_ERROR
  );
}
