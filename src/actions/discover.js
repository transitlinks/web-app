import { graphqlAction } from './utils';
import {
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR
} from '../constants';
import { getDiscoverQuery } from '../data/queries/queries';

export const getDiscoveries = (params, reset) => {

  return async (...args) => {

    const query = `query {
          ${getDiscoverQuery(params)}
        }`

    const { offset, limit } = params;

    return graphqlAction(
      ...args,
      { query, variables: { reset, offset, limit } }, [ 'discover' ],
      GET_DISCOVER_START,
      GET_DISCOVER_SUCCESS,
      GET_DISCOVER_ERROR
    );

  };

}
