import { graphqlReduce, propToState } from "./utils";
import {
  SAVE_TERMINAL_ERROR,
  SAVE_TERMINAL_START,
  SAVE_TERMINAL_SUCCESS,
  GET_TERMINALS_ERROR,
  GET_TERMINALS_START,
  GET_TERMINALS_SUCCESS,
  GET_FEED_START,
  GET_FEED_SUCCESS,
  GET_FEED_ERROR,
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  DELETE_CHECKIN_START,
  DELETE_CHECKIN_SUCCESS,
  DELETE_CHECKIN_ERROR,
} from '../constants';

export default function reduce(state = {}, action) {

  switch (action.type) {

    case GET_FEED_START:
    case GET_FEED_SUCCESS:
    case GET_FEED_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => {
            return {
              ...state,
              savedTerminal: null
            };
          },
          success: () => state,
          error: () => state
        },
        GET_FEED_START,
        GET_FEED_SUCCESS,
        GET_FEED_ERROR
      );
    case SAVE_CHECKIN_START:
    case SAVE_CHECKIN_SUCCESS:
    case SAVE_CHECKIN_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => state,
          success: () => ({ ...state, terminalProperties: {}, savedTerminal: null }),
          error: () => state
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
          start: () => state,
          success: () => ({ ...state, terminalProperties: {}, savedTerminal: null, terminal: null }),
          error: () => state
        },
        DELETE_CHECKIN_START,
        DELETE_CHECKIN_SUCCESS,
        DELETE_CHECKIN_ERROR
      );
    case SAVE_TERMINAL_START:
    case SAVE_TERMINAL_SUCCESS:
    case SAVE_TERMINAL_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({
            terminal: null,
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
