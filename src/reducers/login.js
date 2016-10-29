import {
  SET_LOGIN_PARAMS
} from '../constants';

export default function setLoginParams(state = null, action) {
  
  switch (action.type) {
    
    case SET_LOGIN_PARAMS:
      return { ...state, loginParams: action.payload.loginParams };
    default:
      return { ...state, loginParams: { email: '', password: '' } };

  }

}
