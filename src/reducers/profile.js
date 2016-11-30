import {
  SET_PROPERTY
} from '../constants';

export default function reduce(state = { email: '', password: '' }, action) {
  
  if (action.type === SET_PROPERTY) {
    switch (action.payload.name) {
      case 'profile-email':
        return { ...state, email: action.payload.value.email, emailValid: action.payload.value.valid };
      case 'profile-password':
        return { ...state, password: action.payload.value.password, passwordValid: action.payload.value.valid };
    }
  }

  return state;

}
