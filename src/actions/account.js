import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  SAVE_PROFILE_START,
  SAVE_PROFILE_SUCCESS,
  SAVE_PROFILE_ERROR
} from '../constants';

const saveUser = (uuid, values, startCode, successCode, errorCode) => {
  
  return async (...args) => {
    
    const query = `
      mutation saveUser {
        user (uuid: "${uuid}", values: ${toGraphQLObject(values)}) {
          uuid,
          email
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
