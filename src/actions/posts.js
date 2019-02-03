import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import {
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  SAVE_POST_ERROR,
  GET_POSTS_START,
  GET_POSTS_SUCCESS,
  GET_POSTS_ERROR, SEARCH_LINKS_START, SEARCH_LINKS_SUCCESS, SEARCH_LINKS_ERROR
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

export const getPosts = (input) => {

  console.log("getting posts");

  return async (...args) => {

    const query = `
      query {
        posts (input:"${input}") {
          uuid,
          text
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'posts' ],
      GET_POSTS_START,
      GET_POSTS_SUCCESS,
      GET_POSTS_ERROR
    );

  };

}
