import { graphqlReduce } from './utils';
import {
  SET_PROPERTY,
  SEARCH_LINKS_START,
  SEARCH_LINKS_SUCCESS,
  SEARCH_LINKS_ERROR
} from '../constants';

export default function searchLinks(state = null, action) {
  
  switch (action.type) {
    case SET_PROPERTY:
      if (action.payload.name === 'searchInput') {
        return { ...state, searchInput: action.payload.value };
      }
  }
  
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
