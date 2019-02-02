import { graphqlReduce, propToState } from "./utils";
import {
  SAVE_POST_ERROR,
  SAVE_POST_START,
  SAVE_POST_SUCCESS
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

  }

  return propToState(action, 'add', { ...state });

}
