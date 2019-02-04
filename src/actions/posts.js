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
  GET_CHECKINS_START,
  GET_CHECKINS_SUCCESS,
  GET_CHECKINS_ERROR
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

    console.log("executing action", query);
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

export const getCheckIns = (input) => {

  return async (...args) => {

    const query = `
      query {
        checkIns (input:"${input}") {
          checkIns {
            uuid,
            latitude,
            longitude
          }
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'checkIns' ],
      GET_CHECKINS_START,
      GET_CHECKINS_SUCCESS,
      GET_CHECKINS_ERROR
    );

  };

}
