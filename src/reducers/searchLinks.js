import { graphqlReduce } from './utils';
import {
  SEARCH_LINKS_START,
  SEARCH_LINKS_SUCCESS,
  SEARCH_LINKS_ERROR
} from '../constants';

export default function searchLinks(state = null, action) {
  console.log("ACTION PLD", action.type, action.payload);
  return graphqlReduce(
    state, action,
    { 
      start: () => ({ links: [] }), 
      success: () => ({ links: action.payload.links }), 
      error: () => ({ links: [] })
    },
    SEARCH_LINKS_START,
    SEARCH_LINKS_SUCCESS,
    SEARCH_LINKS_ERROR
  );
}
