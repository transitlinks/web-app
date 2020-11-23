import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  SAVE_PROFILE_START,
  SAVE_PROFILE_SUCCESS,
  SAVE_PROFILE_ERROR,
  REQUEST_RESET_PASSWORD_START,
  REQUEST_RESET_PASSWORD_SUCCESS,
  REQUEST_RESET_PASSWORD_ERROR,
  CODE_RESET_PASSWORD_START,
  CODE_RESET_PASSWORD_SUCCESS,
  CODE_RESET_PASSWORD_ERROR

} from '../constants';

const saveUser = (uuid, values, startCode, successCode, errorCode) => {

  return async (...args) => {

    const query = `
      mutation saveUser {
        user (uuid: "${uuid}", values: ${toGraphQLObject(values)}) {
          uuid,
          email,
          username,
          avatar,
          avatarSource,
          avatarX,
          avatarY,
          avatarScale
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'user' ],
      startCode, successCode, errorCode
    );

  };

};

export const resetPassword = (uuid, password) => {
  return saveUser(
    uuid, { password },
    RESET_PASSWORD_START, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_ERROR
  );
};

export const saveProfile = (uuid, properties) => {
  return saveUser(
    uuid, properties,
    SAVE_PROFILE_START, SAVE_PROFILE_SUCCESS, SAVE_PROFILE_ERROR
  );
};


export const requestResetPassword = (email) => {

  return async (...args) => {

    const query = `
      mutation requestResetPassword {
        requestResetPassword(email:"${email}")
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'requestResetPassword' ],
      REQUEST_RESET_PASSWORD_START,
      REQUEST_RESET_PASSWORD_SUCCESS,
      REQUEST_RESET_PASSWORD_ERROR
    );

  };

};

export const codeResetPassword = (code, password) => {

  return async (...args) => {

    const query = `
      mutation codeResetPassword {
        codeResetPassword(code:"${code}", password:"${password}")
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'codeResetPassword' ],
      CODE_RESET_PASSWORD_START,
      CODE_RESET_PASSWORD_SUCCESS,
      CODE_RESET_PASSWORD_ERROR
    );

  };

};
