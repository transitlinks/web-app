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
  DELETE_CHECKIN_START,
  DELETE_CHECKIN_SUCCESS,
  DELETE_CHECKIN_ERROR,
  MEDIA_FILE_UPLOAD_START,
  MEDIA_FILE_UPLOAD_SUCCESS,
  MEDIA_FILE_UPLOAD_ERROR,
  GET_FEED_START,
  GET_FEED_SUCCESS,
  GET_FEED_ERROR,
  GET_FEEDITEM_START,
  GET_FEEDITEM_SUCCESS,
  GET_FEEDITEM_ERROR,
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
          success: () => {
            const checkIn = Object.assign(
              action.payload.checkIn,
              { saved: (new Date()).getTime() }
            );
            const { feedProperties } = state;
            console.log(feedProperties);
            if (feedProperties) {
              if (feedProperties['frame-add']) {
                if (feedProperties['feed-1']) {
                  feedProperties['feed-1'] = Object.assign({}, feedProperties['frame-add']);
                }
                feedProperties['frame-add'] = {};
              }
            }
            return { checkIn, feedProperties, error: null };
          },
          error: () => ({ checkIn: null, error: action.payload.error })
        },
        SAVE_CHECKIN_START,
        SAVE_CHECKIN_SUCCESS,
        SAVE_CHECKIN_ERROR
      );
    case DELETE_CHECKIN_START:
    case DELETE_CHECKIN_SUCCESS:
    case DELETE_CHECKIN_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            deletedCheckIn: Object.assign(
              action.payload,
              { deleted: (new Date()).getTime() }
            )
          }),
          error: () => ({ deletedCheckIn: null })
        },
        DELETE_CHECKIN_START,
        DELETE_CHECKIN_SUCCESS,
        DELETE_CHECKIN_ERROR
      );
    case MEDIA_FILE_UPLOAD_START:
    case MEDIA_FILE_UPLOAD_SUCCESS:
    case MEDIA_FILE_UPLOAD_ERROR:
      const mediaItems = state.mediaItems || [];
      if (action.type === MEDIA_FILE_UPLOAD_SUCCESS) {
        mediaItems.push(action.payload.mediaItem);
      }
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            mediaItems
          }),
          error: () => ({})
        },
        MEDIA_FILE_UPLOAD_START,
        MEDIA_FILE_UPLOAD_SUCCESS,
        MEDIA_FILE_UPLOAD_ERROR
      );
    case GET_FEED_START:
    case GET_FEED_SUCCESS:
    case GET_FEED_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => {
            return {
              ...state,
              loadingFeed: !state.prevResultCount || state.prevResultCount > 0
            };
          },
          success: () => {
            const { feed } = action.payload;
            const stateFeed = state.feed || { feedItems: [] };
            for (let i = 0; i < feed.feedItems.length; i++) {
              stateFeed.feedItems.push(feed.feedItems[i]);
            }
            return {
              feed: stateFeed,
              feedOffset: stateFeed.feedItems.length,
              loadingFeed: false,
              prevResultCount: feed.feedItems.length
            };
          },
          error: () => ({
            feed: null,
            loadingFeed: false
          })
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
            loadingFeedItem: 'loading'
          }),
          success: () => {

            let { fetchedFeedItems } = state;
            if (!fetchedFeedItems) fetchedFeedItems = {};
            const { feedItem, variables } = action.payload;
            fetchedFeedItems[variables.frameId] = feedItem;

            return {
              fetchedFeedItems,
              loadingFeedItem: 'loaded',
              feedUpdated: (new Date()).getTime()
            };

          },
          error: () => ({
            fetchedFeedItems: {},
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
