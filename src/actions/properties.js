import {
  SET_PROPERTY,
  SET_DEEP_PROPERTY
} from '../constants';


export function setProperty(name, value, command) {

  return async (dispatch) => {

    dispatch({
      type: command || SET_PROPERTY,
      payload: {
        name,
        value
      },
    });

    return true;

  };

}

export function setDeepProperty(store, path, value) {

  return async (dispatch) => {

    dispatch({
      type: SET_DEEP_PROPERTY,
      payload: {
        store,
        path,
        value
      },
    });

    return true;

  };

}
