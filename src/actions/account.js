import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  SAVE_USER_START,
  SAVE_USER_SUCCESS,
  SAVE_USER_ERROR
} from '../constants';

const saveUserProperties = (uuid, values, startCode, successCode, errorCode) => {
  
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
  return saveUserProperties(
    uuid, { password }, 
    RESET_PASSWORD_START, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_ERROR
  );
};

export const saveUser = (uuid, properties) => {
  return saveUserProperties(
    uuid, properties, 
    SAVE_USER_START, SAVE_USER_SUCCESS, SAVE_USER_ERROR
  );
};
