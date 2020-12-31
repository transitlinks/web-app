import { graphqlReduce, propToState } from "./utils";
import {
  GET_LINKS_START,
  GET_LINKS_SUCCESS,
  GET_LINKS_ERROR,
  SEARCH_LOCALITIES_START,
  SEARCH_LOCALITIES_SUCCESS,
  SEARCH_LOCALITIES_ERROR,
} from "../constants";

export default function reduce(state = {}, action) {

  switch (action.type) {

    case GET_LINKS_START:
    case GET_LINKS_SUCCESS:
    case GET_LINKS_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            transitLinks: action.payload.transitLinks
          }),
          error: () => ({ transitLinks: null })
        },
        GET_LINKS_START,
        GET_LINKS_SUCCESS,
        GET_LINKS_ERROR
      );

    case SEARCH_LOCALITIES_START:
    case SEARCH_LOCALITIES_SUCCESS:
    case SEARCH_LOCALITIES_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            searchLocalities: action.payload.searchLocalities
          }),
          error: () => ({ searchLocalities: null })
        },
        SEARCH_LOCALITIES_START,
        SEARCH_LOCALITIES_SUCCESS,
        SEARCH_LOCALITIES_ERROR,
      );

  }

  return propToState(action, 'links', { ...state });

}
