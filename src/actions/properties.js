import {
  SET_PROPERTY
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
