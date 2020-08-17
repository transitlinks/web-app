import { graphqlAction } from './utils';
import { getBoundsZoomLevel, getMapBounds } from '../services/linkService';

import {
  GET_LINKS_START,
  GET_LINKS_SUCCESS,
  GET_LINKS_ERROR,
  SET_PROPERTY
} from '../constants';
import { getLinksQuery } from '../data/queries/queries';

export const getLinks = (params) => {

  return async (...args) => {

    const query = `query {
          ${getLinksQuery(params)}
        }`;

    return graphqlAction(
      ...args,
      { query }, [ 'transitLinks' ],
      GET_LINKS_START,
      GET_LINKS_SUCCESS,
      GET_LINKS_ERROR
    );

  };

};

export function setZoomLevel(linkStats, linkMode) {

  return async (dispatch) => {
    console.log('set zoom level for', linkStats);
    const bounds = getMapBounds(linkStats, linkMode);
    const zoomLevel = getBoundsZoomLevel(bounds, { width: 400, height: 400 });
    dispatch({
      type: SET_PROPERTY,
      payload: {
        name: 'links.mapZoom',
        value: {
          updated: (new Date()).getTime(),
          zoomLevel,
          bounds
        }
      },
    });

    return true;

  };

}
