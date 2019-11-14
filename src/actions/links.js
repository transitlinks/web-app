import { graphqlAction } from './utils';
import {
  GET_LINKS_START,
  GET_LINKS_SUCCESS,
  GET_LINKS_ERROR
} from '../constants';

export const getLinks = (locality, type) => {

  return async (...args) => {

    const query = `query {
          terminals (locality: "${locality}", type: "${type}") {
             uuid
          }
        }`

    return graphqlAction(
      ...args,
      { query }, [ 'terminals' ],
      GET_LINKS_START,
      GET_LINKS_SUCCESS,
      GET_LINKS_ERROR
    );

  };

}
