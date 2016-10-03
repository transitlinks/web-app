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
          id,
          from { name, lat, lng },
          to { name, lat, lng },
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
