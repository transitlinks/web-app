import { graphqlReduce, propToState } from "./utils";
import {
  SAVE_POST_ERROR,
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  GET_POSTS_ERROR,
  GET_POSTS_START,
  GET_POSTS_SUCCESS,
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  GET_CHECKINS_START,
  GET_CHECKINS_SUCCESS,
  GET_CHECKINS_ERROR
} from "../constants";

export default function reduce(state = {}, action) {

  switch (action.type) {

    case SAVE_POST_START:
    case SAVE_POST_SUCCESS:
    case SAVE_POST_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({ post: null }),
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
          start: () => ({ posts: null }),
          success: () => ({
            posts: action.payload.posts
          }),
          error: () => ({ posts: null })
        },
        GET_POSTS_START,
        GET_POSTS_SUCCESS,
        GET_POSTS_ERROR
      );
    case SAVE_CHECKIN_START:
    case SAVE_CHECKIN_SUCCESS:
    case SAVE_CHECKIN_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({ checkIn: null }),
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
    case GET_CHECKINS_START:
    case GET_CHECKINS_SUCCESS:
    case GET_CHECKINS_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({ checkIns: null }),
          success: () => ({
            checkIns: action.payload.checkIns.checkIns
          }),
          error: () => ({ checkIns: null })
        },
        GET_CHECKINS_START,
        GET_CHECKINS_SUCCESS,
        GET_CHECKINS_ERROR
      );

  }

  return propToState(action, 'add', { ...state });

}
