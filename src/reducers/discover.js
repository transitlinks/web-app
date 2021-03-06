import { graphqlReduce, propToState } from "./utils";
import {
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR,
} from '../constants';

export default function reduce(state = {}, action) {

  switch (action.type) {

    case GET_DISCOVER_START:
    case GET_DISCOVER_SUCCESS:
    case GET_DISCOVER_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => {
            return {
              ...state,
              loadingDiscover: !state.prevResultCount || state.prevResultCount > 0
            };
          },
          success: () => {
            const { discover, variables: { reset } } = action.payload;
            const stateDiscover = (state.discover && !reset) ? state.discover : { discoveries: [] };
            for (let i = 0; i < discover.discoveries.length; i++) {
              stateDiscover.discoveries.push(discover.discoveries[i]);
            }

            return {
              discover: stateDiscover,
              localityOffset: discover.localityOffset,
              countryOffset: discover.countryOffset,
              tagOffset: discover.tagOffset,
              tripOffset: discover.tripOffset,
              userOffset: discover.userOffset,
              offset: stateDiscover.discoveries.length,
              loadingDiscover: false,
              prevResultCount: discover.discoveries.length,
              discoverUpdated: new Date()
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
