import { graphqlReduce, propToState } from "./utils";
import {
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR,
  SAVE_LIKE_START,
  SAVE_LIKE_SUCCESS,
  SAVE_LIKE_ERROR,
  SAVE_COMMENT_START,
  SAVE_COMMENT_SUCCESS, SAVE_COMMENT_ERROR,
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
            const { discover, variables: { reset, limit, offset } } = action.payload;
            const stateDiscover = (state.discover && !reset) ? state.discover : { discoveries: [] };
            for (let i = 0; i < discover.discoveries.length; i++) {
              stateDiscover.discoveries.push(discover.discoveries[i]);
            }

            return {
              discover: stateDiscover,
              localityOffset: discover.localityOffset,
              tagOffset: discover.tagOffset,
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

    case SAVE_LIKE_START:
    case SAVE_LIKE_SUCCESS:
    case SAVE_LIKE_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => {

            const { discover } = state;
            const { entityUuid, onOff, likes } = action.payload.like;
            if (discover) {
              const discoveryItem = discover.discoveries
                .find(discovery => discovery.feedItem.checkIn.uuid === entityUuid);
              if (discoveryItem) {
                discoveryItem.feedItem.checkIn.likes = likes;
                discoveryItem.feedItem.checkIn.likedByUser = onOff === 'on';
              }
            }

            return {
              like: action.payload.like,
              discover,
              discoverUpdated: (new Date()).getTime()
            };
          },
          error: () => ({ like: null })
        },
        SAVE_LIKE_START,
        SAVE_LIKE_SUCCESS,
        SAVE_LIKE_ERROR
      );

  }

  return propToState(action, 'discover', { ...state });

}
