import { graphqlAction } from './utils';
import {
  GET_LINKS_START,
  GET_LINKS_SUCCESS,
  GET_LINKS_ERROR
} from '../constants';

export const getLinks = (params) => {

  return async (...args) => {

    const paramKeys = Object.keys(params);
    const paramsStringElems = paramKeys.map(paramKey => `${paramKey}: "${params[paramKey]}"`);
    let paramsString = paramsStringElems.join(', ');
    if (paramsString.length > 0) {
      paramsString = '(' + paramsString + ')';
    }

    const query = `query {
          transitLinks ${paramsString} {
             uuid,
             transport,
             transportId,
             from {
              latitude,
              longitude,
              locality,
              formattedAddress
             },
             to {
              latitude,
              longitude,
              locality,
              formattedAddress
             }
          }
        }`

    return graphqlAction(
      ...args,
      { query }, [ 'transitLinks' ],
      GET_LINKS_START,
      GET_LINKS_SUCCESS,
      GET_LINKS_ERROR
    );

  };

}
