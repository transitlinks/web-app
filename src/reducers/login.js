import {
  SET_PROPERTY
} from '../constants';

export default function setLoginParams(state = { login: '', password: '' }, action) {
  
  if (action.type === SET_PROPERTY) {
    switch (action.payload.name) {
      case 'login-email':
        return { ...state, email: action.payload.value.email, emailValid: action.payload.value.valid };
      case 'login-password':
        return { ...state, password: action.payload.value.password, passwordValid: action.payload.value.valid };
    }
  }

  return state;

}
