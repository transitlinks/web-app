import { graphqlReduce, propToState } from "./utils";
import {
  SAVE_POST_ERROR,
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  GET_POSTS_ERROR,
  GET_POSTS_START,
  GET_POSTS_SUCCESS,
  GET_TERMINALS_ERROR,
  GET_TERMINALS_START,
  GET_TERMINALS_SUCCESS,
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  DELETE_CHECKIN_START,
  DELETE_CHECKIN_SUCCESS,
  DELETE_CHECKIN_ERROR,
  DELETE_POST_START,
  DELETE_POST_SUCCESS,
  DELETE_POST_ERROR,
  DELETE_TERMINAL_START,
  DELETE_TERMINAL_SUCCESS,
  DELETE_TERMINAL_ERROR,
  MEDIA_FILE_UPLOAD_START,
  MEDIA_FILE_UPLOAD_SUCCESS,
  MEDIA_FILE_UPLOAD_ERROR,
  GET_FEED_START,
  GET_FEED_SUCCESS,
  GET_FEED_ERROR,
  GET_FEEDITEM_START,
  GET_FEEDITEM_SUCCESS,
  GET_FEEDITEM_ERROR,
  GET_MEDIAITEM_START,
  GET_MEDIAITEM_SUCCESS,
  GET_MEDIAITEM_ERROR,
  DELETE_MEDIAITEM_START,
  DELETE_MEDIAITEM_SUCCESS,
  DELETE_MEDIAITEM_ERROR,
  SAVE_LIKE_START,
  SAVE_LIKE_SUCCESS,
  SAVE_LIKE_ERROR
} from '../constants';

export default function reduce(state = {}, action) {

  switch (action.type) {

    case SAVE_POST_START:
    case SAVE_POST_SUCCESS:
    case SAVE_POST_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => {
            return {
              post: Object.assign(
                action.payload.post,
                { saved: (new Date()).getTime() }
              ),
              editPost: {},
              mediaItems: [],
              savedPost: action.payload.post
            };
          },
          error: () => ({ post: null })
        },
        SAVE_POST_START,
        SAVE_POST_SUCCESS,
        SAVE_POST_ERROR
      );
    case SAVE_LIKE_START:
    case SAVE_LIKE_SUCCESS:
    case SAVE_LIKE_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => {

            const { feed, fetchedFeedItem } = state;
            const { feedItems } = feed;
            const { entityUuid, entityType, onOff, likes } = action.payload.like;

            const feedItem = feedItems.find(item => item.checkIn.uuid === entityUuid);
            if (entityType === 'CheckIn' && feedItem) {
              feedItem.checkIn.likes = likes;
              feedItem.checkIn.likedByUser = onOff === 'on';
            }

            if (fetchedFeedItem && fetchedFeedItem.checkIn.uuid === entityUuid) {
              fetchedFeedItem.checkIn.likes = likes;
              fetchedFeedItem.checkIn.likedByUser = onOff === 'on';
            }

            return {
              like: action.payload.like,
              feed: {
                ...feed,
                feedItems
              },
              fetchedFeedItem,
              feedUpdated: (new Date()).getTime()
            };
          },
          error: () => ({ like: null })
        },
        SAVE_LIKE_START,
        SAVE_LIKE_SUCCESS,
        SAVE_LIKE_ERROR
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
            if (feedProperties) {
              if (feedProperties['frame-add']) {
                if (feedProperties['feed-1']) {
                  feedProperties['feed-1'] = Object.assign({}, feedProperties['frame-add']);
                }
                feedProperties['frame-add'] = {};
              }
            }

            const fetchedFeedItems = state.fetchedFeedItems || {};
            fetchedFeedItems['frame-new'] = null; //{ checkIn };
            return {
              checkIn,
              feedProperties,
              fetchedFeedItem: null,
              fetchedFeedItems,
              error: null
            };
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
    case DELETE_POST_START:
    case DELETE_POST_SUCCESS:
    case DELETE_POST_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => {
            return {
              deletedPost: action.payload.deletePost
            };
          },
          error: () => ({ deletedPost: null })
        },
        DELETE_POST_START,
        DELETE_POST_SUCCESS,
        DELETE_POST_ERROR
      );
    case DELETE_TERMINAL_START:
    case DELETE_TERMINAL_SUCCESS:
    case DELETE_TERMINAL_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => {
            return {
              deletedTerminal: action.payload.deleteTerminal
            };
          },
          error: () => ({ deletedTerminal: null })
        },
        DELETE_TERMINAL_START,
        DELETE_TERMINAL_SUCCESS,
        DELETE_TERMINAL_ERROR
      );
    case MEDIA_FILE_UPLOAD_START:
    case MEDIA_FILE_UPLOAD_SUCCESS:
    case MEDIA_FILE_UPLOAD_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => {
            return {
              uploadingMedia: true
            };
          },
          success: () => ({
            loadMediaItem: action.payload.mediaItem,
            uploadingMedia: false,
            loadedMediaItemChanged: 1
          }),
          error: () => ({
            uploadingMedia: false
          })
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

            const { feed, variables: { add, user, tags, locality } } = action.payload;

            const additionalFields = {};
            if (user || tags || locality) {
              additionalFields.query = { user, tags, locality };
            }

            if (!add) {
              return {
                feed: { ...feed, ...additionalFields },
                loadingFeed: false,
                feedOffset: feed.feedItems.length
              };
            }

            const stateFeed = state.feed || { feedItems: [] };
            for (let i = 0; i < feed.feedItems.length; i++) {
              stateFeed.feedItems.push(feed.feedItems[i]);
            }

            return {
              feed: { ...stateFeed, ...additionalFields },
              feedOffset: stateFeed.feedItems.length,
              loadingFeed: false,
              prevResultCount: feed.feedItems.length,
              feedUpdated: (new Date()).getTime()
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
            const fetchedFeedItem = variables.frameId === 'frame-edit' ? feedItem : null;
            return {
              fetchedFeedItems,
              fetchedFeedItem,
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
    case GET_MEDIAITEM_START:
    case GET_MEDIAITEM_SUCCESS:
    case GET_MEDIAITEM_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({
            loadingMediaItem: true,
            loadMediaItemError: null
          }),
          success: () => {

            const { mediaItem } = action.payload;
            const stateMediaItem = state.loadMediaItem;

            if (mediaItem.uploadStatus === 'uploaded') {
              const mediaItems = state.mediaItems || [];
              mediaItems.push(action.payload.mediaItem);
              return {
                loadMediaItem: null,
                mediaItems
              };
            } else {
              console.log(mediaItem.uploadProgress, stateMediaItem.uploadProgress);
              return {
                loadMediaItem: mediaItem,
                loadedMediaItemChanged: mediaItem.uploadProgress > stateMediaItem.uploadProgress ? 1 : 0
              };
            }
          },
          error: () => ({
            error: null,
            loadMediaItemError: action.payload.error,
            loadMediaItem: null,
            loadedMediaItemChanged: -1
          })
        },
        GET_MEDIAITEM_START,
        GET_MEDIAITEM_SUCCESS,
        GET_MEDIAITEM_ERROR
      );
    case DELETE_MEDIAITEM_START:
    case DELETE_MEDIAITEM_SUCCESS:
    case DELETE_MEDIAITEM_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({
            deletingMediaItem: true,
            deleteMediaItemError: null
          }),
          success: () => {

            const { deleteMediaItem } = action.payload;
            const mediaItems = state.mediaItems || [];
            const updatedMediaItems = mediaItems.filter(mediaItem => mediaItem.uuid !== deleteMediaItem.uuid);
            return {
              mediaItems: updatedMediaItems,
              deletingMediaItem: false
            };

          },
          error: () => ({
            deletingMediaItem: false,
            deleteMediaItemError: action.payload.error
          })
        },
        DELETE_MEDIAITEM_START,
        DELETE_MEDIAITEM_SUCCESS,
        DELETE_MEDIAITEM_ERROR
      );

  }

  return propToState(action, 'posts', { ...state });

}
