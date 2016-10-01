import { graphqlReduce } from './utils';
import { getLog } from '../core/log';
const log = getLog('reducers/intl');

import {
  SET_LOCALE_START,
  SET_LOCALE_SUCCESS,
  SET_LOCALE_ERROR,
} from '../constants';


export default function intl(state = null, action) {
  
  if (state === null) {
    return {
      initialNow: Date.now(),
    };
  }
   
  return graphqlReduce(
    state, action,
    { 
      
      start: () => {
        
        const { locale } = action.payload.variables;
        const origLocale = state[locale] ? locale : state.locale;
        return { 
          locale: origLocale, 
          origLocale 
        };
      
      }, 
      
      success: () => {
        
        const { locale } = action.payload.variables;
        const messages = action.payload.intl.reduce((msgs, msg) => {
          msgs[msg.id] = msg.message; // eslint-disable-line no-param-reassign
          return msgs;
        }, {});
        
        // remember locale for every new request
        if (process.env.BROWSER) {
          const maxAge = 3650 * 24 * 3600; // 10 years in seconds
          document.cookie = `lang=${locale};path=/;max-age=${maxAge}`;
        }

        return {
          locale,
          newLocale: null,
          messages: {
            ...state.messages,
            [locale]: messages,
          },
        };
      
      },
      
      error: () => ({ newLocale: () => null })
    
    },
    
    SET_LOCALE_START,
    SET_LOCALE_SUCCESS,
    SET_LOCALE_ERROR
  
  );

}
