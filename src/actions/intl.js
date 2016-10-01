import { graphqlAction } from './utils';
import {
  SET_LOCALE_START,
  SET_LOCALE_SUCCESS,
  SET_LOCALE_ERROR,
} from '../constants';


export function setLocale({ locale }) {
  
  return async (...args) => {
    
    const query = `
      query ($locale:String!) {
        intl (locale:$locale) {
          id
          message
        }
      }
    `;
    
    return graphqlAction(
      ...args, 
      { query, variables: { locale } }, [ 'intl' ],
      SET_LOCALE_START,
      SET_LOCALE_SUCCESS,
      SET_LOCALE_ERROR
    );

  };

}
