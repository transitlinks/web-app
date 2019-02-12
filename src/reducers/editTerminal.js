import { graphqlReduce, propToState } from "./utils";
import {
  SAVE_TERMINAL_ERROR,
  SAVE_TERMINAL_START,
  SAVE_TERMINAL_SUCCESS,
  GET_TERMINALS_ERROR,
  GET_TERMINALS_START,
  GET_TERMINALS_SUCCESS
} from "../constants";

export default function reduce(state = {}, action) {

  switch (action.type) {

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

  }

  return propToState(action, 'editTerminal', { ...state });

}
