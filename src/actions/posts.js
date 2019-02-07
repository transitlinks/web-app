import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  SAVE_POST_ERROR,
  GET_POSTS_START,
  GET_POSTS_SUCCESS,
  GET_POSTS_ERROR,
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  GET_FEED_START,
  GET_FEED_SUCCESS,
  GET_FEED_ERROR,
  GET_FEEDITEM_START,
  GET_FEEDITEM_SUCCESS,
  GET_FEEDITEM_ERROR
} from '../constants';

export const saveCheckIn = ({ checkIn }) => {

  return async (...args) => {

    const query = `
      mutation saveCheckIn {
        checkIn(checkIn:${toGraphQLObject(checkIn)}) {
          uuid,
          latitude,
          longitude
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'checkIn' ],
      SAVE_CHECKIN_START,
      SAVE_CHECKIN_SUCCESS,
      SAVE_CHECKIN_ERROR
    );

  };

}

export const savePost = ({ post }) => {

  return async (...args) => {

    const query = `
      mutation savePost {
        post(post:${toGraphQLObject(post)}) {
          uuid,
          text
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'post' ],
      SAVE_POST_START,
      SAVE_POST_SUCCESS,
      SAVE_POST_ERROR
    );

  };

}

export const getPosts = (input) => {

  return async (...args) => {

    const query = `
      query {
        posts (input:"${input}") {
          uuid,
          text
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'posts' ],
      GET_POSTS_START,
      GET_POSTS_SUCCESS,
      GET_POSTS_ERROR
    );

  };

}

export const getFeed = (input) => {

  return async (...args) => {

    const query = `
      query {
        feed (input:"${input}") {
          feedItems {
            checkIn {
              uuid,
              latitude,
              longitude
            },
            inbound {
              uuid,
              latitude,
              longitude
            },
            outbound {
              uuid,
              latitude,
              longitude
            },
            posts {
              uuid,
              text
            }
          }
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'feed' ],
      GET_FEED_START,
      GET_FEED_SUCCESS,
      GET_FEED_ERROR
    );

  };

}

export const getFeedItem = (checkInUuid) => {

  return async (...args) => {

    const query = `
      query {
        feedItem (checkInUuid:"${checkInUuid}") {
          checkIn {
            uuid,
            latitude,
            longitude
          },
          inbound {
            uuid,
            latitude,
            longitude
          },
          outbound {
            uuid,
            latitude,
            longitude
          },
          posts {
            uuid,
            text
          }
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'feedItem' ],
      GET_FEEDITEM_START,
      GET_FEEDITEM_SUCCESS,
      GET_FEEDITEM_ERROR
    );

  };

}
