import {
  SET_LOGIN_PARAMS
} from '../constants';

export function setLoginParams(loginParams) {
  
  return async (dispatch) => {
    
    dispatch({
      type: SET_LOGIN_PARAMS,
      payload: {
        loginParams
      }
    });

    return true;
  
  }

}
