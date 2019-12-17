import { graphqlReduce, propToState } from "./utils";
import {
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR,
  GET_FEEDITEM_START,
  GET_FEEDITEM_SUCCESS,
  GET_FEEDITEM_ERROR
} from "../constants";

export default function reduce(state = {}, action) {

  switch (action.type) {

    case GET_DISCOVER_START:
    case GET_DISCOVER_SUCCESS:
    case GET_DISCOVER_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => {
            const { feed, variables: { add, offset, limit } } = action.payload;
            return {
              ...state,
              loadingDiscover: !state.prevResultCount || state.prevResultCount > 0
            };
          },
          success: () => {
            const { discover, variables: { add, offset, limit } } = action.payload;
            const stateDiscover = state.discover;
            for (let i = 0; i < discover.discoveries.length; i++) {
              stateDiscover.discoveries.push(discover.discoveries[i]);
            }
            return {
              discover: stateDiscover,
              discoverOffset: stateDiscover.discoveries.length,
              loadingDiscover: false,
              prevResultCount: discover.discoveries.length
            };
          },
          error: () => ({
            discover: null,
            loadingDiscover: false
          })
        },
        GET_DISCOVER_START,
        GET_DISCOVER_SUCCESS,
        GET_DISCOVER_ERROR
      );

  }

  return propToState(action, 'discover', { ...state });

}
