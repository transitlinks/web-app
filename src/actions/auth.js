import {
  SET_AUTH
} from '../constants';

export const setAuth = (auth) => {

  return async (dispatch) => {

    dispatch({
      type: SET_AUTH,
      payload: {
        auth
      }
    });

    return true;

  }

};
