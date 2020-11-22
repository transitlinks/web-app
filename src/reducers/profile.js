import {
  SET_PROPERTY,
  SAVE_PROFILE_SUCCESS,
  SAVE_PROFILE_ERROR,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  CODE_RESET_PASSWORD_START,
  CODE_RESET_PASSWORD_SUCCESS,
  CODE_RESET_PASSWORD_ERROR,
  REQUEST_RESET_PASSWORD_START,
  REQUEST_RESET_PASSWORD_SUCCESS,
  REQUEST_RESET_PASSWORD_ERROR
} from '../constants';
import { graphqlReduce, propToState } from './utils';

export default function reduce(state = { email: null, password: '' }, action) {

  delete state.saveProfileResult;
  delete state.resetPasswordResult;

  if (action.type === SET_PROPERTY) {
    switch (action.payload.name) {
      case 'profile-email':
        return {
          ...state,
          email: action.payload.value.email,
          emailValid: action.payload.value.valid
        };
      case 'profile-password':
        return {
          ...state,
          password: action.payload.value.password,
          passwordValid: action.payload.value.valid
        };
    }
  }

  switch (action.type) {
    case SAVE_PROFILE_SUCCESS:
      return {
        ...state,
        savedProfile: {
          username: action.payload.user.username,
          email: action.payload.user.email,
          avatar: action.payload.user.avatar
        },
        saveProfileResult: 'success'
      };
    case SAVE_PROFILE_ERROR:
      return { ...state, saveProfileResult: 'error' };
    case RESET_PASSWORD_SUCCESS:
      return { ...state, resetPasswordResult: 'success' };
    case RESET_PASSWORD_ERROR:
      return { ...state, resetPasswordResult: 'error' };
    case REQUEST_RESET_PASSWORD_START:
    case REQUEST_RESET_PASSWORD_SUCCESS:
    case REQUEST_RESET_PASSWORD_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({ requestResetPassword: action.payload.requestResetPassword }),
          error: () => ({ requestResetPassword: 'ERROR' })
        },
        REQUEST_RESET_PASSWORD_START,
        REQUEST_RESET_PASSWORD_SUCCESS,
        REQUEST_RESET_PASSWORD_ERROR
      );
    case CODE_RESET_PASSWORD_START:
    case CODE_RESET_PASSWORD_SUCCESS:
    case CODE_RESET_PASSWORD_ERROR:
      return graphqlReduce(
        state, action,
        {
          start: () => ({}),
          success: () => ({ codeResetPassword: action.payload.codeResetPassword }),
          error: () => ({ codeResetPassword: 'ERROR' })
        },
        CODE_RESET_PASSWORD_START,
        CODE_RESET_PASSWORD_SUCCESS,
        CODE_RESET_PASSWORD_ERROR
      );
  }

  return propToState(action, 'profile', { ...state });

}
