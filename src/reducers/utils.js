import { SET_PROPERTY, SET_DEEP_PROPERTY } from "../constants";

export function propToState(action, prefix, state) {

  if (action.type === SET_PROPERTY) {
    const { name } = action.payload;
    if (name.startsWith(prefix + '.')) {
      const propName = name.substring(name.indexOf('.') + 1);
      state[propName] = action.payload.value;
    }
  } else if (action.type === SET_DEEP_PROPERTY) {
    const { store, path, value } = action.payload;
    if (store === prefix) {
      let endPath = state;
      for (let i = 0; i < path.length; i++) {
        console.log(endPath, path[i]);
        if (i === path.length - 1) {
          endPath[path[i]] = value;
        } else if (!endPath[path[i]]) {
          endPath[path[i]] = {};
        }
        endPath = endPath[path[i]];
      }
    }
  }

  return {
    ...state,
    propertyUpdated: (new Date()).getTime()
  };

}

export function graphqlReduce(
  state, action,
  valueMap,
  START_CODE, SUCCESS_CODE, ERROR_CODE
) {

  const endState = {
    ...state
  };

  switch (action.type) {

    case START_CODE: {
      const start = valueMap.start();
      Object.keys(start).forEach(key => {
        endState[key] = start[key];
      });
      return endState;
    }

    case SUCCESS_CODE: {
      const success = valueMap.success();
      Object.keys(success).forEach(key => {
        endState[key] = success[key];
      });
      return endState;
    }

    case ERROR_CODE: {
      const error = valueMap.error();
      Object.keys(error).forEach(key => {
        endState[key] = error[key];
      });
      return Object.assign(endState, {
        error: action.payload.error
      });
    }

    default: {
      return endState;
    }

  }

}
