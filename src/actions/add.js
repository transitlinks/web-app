import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  SAVE_POST_ERROR
} from '../constants';

export const savePost = ({ post }) => {

  console.log("saving post", post);

  return async (...args) => {
    
    const query = `
      mutation savePost {
        post(post:${toGraphQLObject(post)}) {
          uuid,
          text
        }
      }
    `;

    console.log("executing action", query);
    return graphqlAction(
      ...args, 
      { query }, [ 'post' ],
      SAVE_POST_START,
      SAVE_POST_SUCCESS,
      SAVE_POST_ERROR
    );
  
  };

}
