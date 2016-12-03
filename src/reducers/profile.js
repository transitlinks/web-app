import {
  SET_PROPERTY,
  SAVE_PROFILE_SUCCESS,
  SAVE_PROFILE_ERROR,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR
} from '../constants';

export default function reduce(state = { email: null, password: '' }, action) {
  
  delete state.saveProfileResult; 
  delete state.resetPasswordResult; 
  
  if (action.type === SET_PROPERTY) {
    switch (action.payload.name) {
      case 'profile-email':
        return { ...state, email: action.payload.value.email, emailValid: action.payload.value.valid };
      case 'profile-password':
        return { ...state, password: action.payload.value.password, passwordValid: action.payload.value.valid };
    }
  }

  switch (action.type) {
    case SAVE_PROFILE_SUCCESS:
      return { ...state, saveProfileResult: 'success' };
    case SAVE_PROFILE_ERROR:
      return { ...state, saveProfileResult: 'error' };
    case RESET_PASSWORD_SUCCESS:
      return { ...state, resetPasswordResult: 'success' };
    case RESET_PASSWORD_ERROR:
      return { ...state, resetPasswordResult: 'error' };
  }

  return state;

}
