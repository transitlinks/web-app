import { graphqlReduce, propToState } from "./utils";
import {
  GET_LINKS_START,
  GET_LINKS_SUCCESS,
  GET_LINKS_ERROR
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

  }

  return propToState(action, 'links', { ...state });

}
