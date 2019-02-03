import { graphqlReduce, propToState } from "./utils";
import {
  SAVE_POST_ERROR,
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  GET_POSTS_ERROR,
  GET_POSTS_START,
  GET_POSTS_SUCCESS
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

  }

  return propToState(action, 'add', { ...state });

}
