import { graphqlReduce, propToState } from "./utils";
import {
  SAVE_POST_ERROR,
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  GET_POSTS_ERROR,
  GET_POSTS_START,
  GET_POSTS_SUCCESS,
  SAVE_TERMINAL_ERROR,
  SAVE_TERMINAL_START,
  SAVE_TERMINAL_SUCCESS,
  GET_TERMINALS_ERROR,
  GET_TERMINALS_START,
  GET_TERMINALS_SUCCESS,
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  GET_FEED_START,
  GET_FEED_SUCCESS,
  GET_FEED_ERROR,
  GET_FEEDITEM_START,
  GET_FEEDITEM_SUCCESS,
  GET_FEEDITEM_ERROR
} from "../constants";

export default function reduce(state = {}, action) {

  switch (action.type) {

    case SAVE_POST_START:
    case SAVE_POST_SUCCESS:
    case SAVE_POST_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            post: Object.assign(
              action.payload.post,
              { saved: (new Date()).getTime() }
            )
          }),
          error: () => ({ post: null })
        },
        SAVE_POST_START,
        SAVE_POST_SUCCESS,
        SAVE_POST_ERROR
      );
    case GET_POSTS_START:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            posts: action.payload.posts
          }),
          error: () => ({ posts: null })
        },
        GET_POSTS_START,
        GET_POSTS_SUCCESS,
        GET_POSTS_ERROR
      );
    case SAVE_TERMINAL_START:
    case SAVE_TERMINAL_SUCCESS:
    case SAVE_TERMINAL_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            savedTerminal: Object.assign(
              action.payload.terminal,
              { saved: (new Date()).getTime() }
            )
          }),
          error: () => ({ savedTerminal: null })
        },
        SAVE_TERMINAL_START,
        SAVE_TERMINAL_SUCCESS,
        SAVE_TERMINAL_ERROR
      );
    case GET_TERMINALS_START:
    case GET_TERMINALS_SUCCESS:
    case GET_TERMINALS_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            terminals: action.payload.posts
          }),
          error: () => ({ terminals: null })
        },
        GET_TERMINALS_START,
        GET_TERMINALS_SUCCESS,
        GET_TERMINALS_ERROR
      );
    case SAVE_CHECKIN_START:
    case SAVE_CHECKIN_SUCCESS:
    case SAVE_CHECKIN_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            checkIn: Object.assign(
              action.payload.checkIn,
              { saved: (new Date()).getTime() }
            )
          }),
          error: () => ({ checkIn: null })
        },
        SAVE_CHECKIN_START,
        SAVE_CHECKIN_SUCCESS,
        SAVE_CHECKIN_ERROR
      );
    case GET_FEED_START:
    case GET_FEED_SUCCESS:
    case GET_FEED_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            feed: action.payload.feed
          }),
          error: () => ({ feed: null })
        },
        GET_FEED_START,
        GET_FEED_SUCCESS,
        GET_FEED_ERROR
      );
    case GET_FEEDITEM_START:
    case GET_FEEDITEM_SUCCESS:
    case GET_FEEDITEM_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({
            selectedFeedItem: action.payload.variables.checkInUuid,
            loadingFeedItem: 'loading'
          }),
          success: () => {
            const { feed } = state;
            console.log("attempt to splice feed", feed);
            if (feed) {
              const { replaceIndex } = action.payload.variables;
              feed.feedItems[replaceIndex] = action.payload.feedItem;
              /*
              for (let i = 0; i < feed.feedItems.length; i++) {
                const feedItem = feed.feedItems[i];
                if (feedItem.checkIn.uuid === replaceUuid) {
                  console.log("setting " + i + " to", action.payload.feedItem.checkIn.uuid);
                  feed.feedItems[i] = action.payload.feedItem;
                  break;
                }
              }
              */

            }
            return {
              fetchedFeedItem: action.payload.feedItem,
              loadedFeed: feed,
              loadingFeedItem: 'loaded'
            };
          },
          error: () => ({
            fetchedFeedItem: null,
            selectedFeedItem: null,
            loadingFeedItem: 'error'
          })
        },
        GET_FEEDITEM_START,
        GET_FEEDITEM_SUCCESS,
        GET_FEEDITEM_ERROR
      );

  }

  return propToState(action, 'posts', { ...state });

}
