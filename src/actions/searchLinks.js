import { graphqlAction } from './utils';
import {
  SEARCH_LINKS_START,
  SEARCH_LINKS_SUCCESS,
  SEARCH_LINKS_ERROR,
} from '../constants';

export const searchLinks = (input) => {
  
  return async (...args) => {
     
    const query = `
      query {
        links (input:"${input}") {
          uuid,
          from { description },
          to { description },
          instanceCount
        }
      }
    `;
    
    return graphqlAction(
      ...args, 
      { query }, [ 'links' ],
      SEARCH_LINKS_START,
      SEARCH_LINKS_SUCCESS,
      SEARCH_LINKS_ERROR
    );

  };

}
