import { graphqlAction } from './utils';
import { getBoundsZoomLevel, getMapBounds } from '../services/linkService';

import {
  GET_LINKS_START,
  GET_LINKS_SUCCESS,
  GET_LINKS_ERROR,
  SET_PROPERTY
} from '../constants';
import { createParamString } from '../core/utils';

export const getLinks = (params) => {

  return async (...args) => {

    const query = `query {
          transitLinks ${createParamString(params)} {
            locality,
            latitude,
            longitude,
            departures {
              checkInUuid,
              type,
              latitude,
              longitude,
              locality,
              formattedAddress,
              transport,
              transportId,
              date,
              time,
              priceAmount,
              priceCurrency,
              description,
              linkedTerminal {
                checkInUuid,
                type,
                latitude,
                longitude,
                locality,
                formattedAddress,
                transport,
                transportId,
                date,
                time,
                description,
                priceAmount,
                priceCurrency
              }
              route { lat, lng }
            },
            arrivals {
              checkInUuid,
              type,
              latitude,
              longitude,
              locality,
              formattedAddress,
              transport,
              transportId,
              date,
              time,
              priceAmount,
              priceCurrency,
              description,
              linkedTerminal {
                checkInUuid,
                type,
                latitude,
                longitude,
                locality,
                formattedAddress,
                transport,
                transportId,
                date,
                time,
                description,
                priceAmount,
                priceCurrency
              }
              route { lat, lng }
            },
            internal {
              checkInUuid,
              type,
              latitude,
              longitude,
              locality,
              formattedAddress,
              transport,
              transportId,
              date,
              time,
              priceAmount,
              priceCurrency,
              description,
              linkedTerminal {
                checkInUuid,
                type,
                latitude,
                longitude,
                locality,
                formattedAddress,
                transport,
                transportId,
                date,
                time,
                description,
                priceAmount,
                priceCurrency
              }
              route { lat, lng }
            },
            departureCount,
            arrivalCount,
            linkedDepartures {
              locality,
              linkedLocality,
              linkedTerminalType,
              linkedTerminalUuid,
              linkedLocalityLatitude,
              linkedLocalityLongitude,
              linkCount
            },
            linkedArrivals {
              locality,
              linkedLocality,
              linkedTerminalType,
              linkedTerminalUuid,
              linkedLocalityLatitude,
              linkedLocalityLongitude,
              linkCount
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

};

export function setZoomLevel(linkStats, linkMode) {

  return async (dispatch) => {

    const bounds = getMapBounds(linkStats, linkMode);
    const zoomLevel = getBoundsZoomLevel(bounds, { width: 400, height: 400 });
    dispatch({
      type: SET_PROPERTY,
      payload: {
        name: 'links.mapZoom',
        value: {
          zoomLevel,
          bounds
        }
      },
    });

    return true;

  };

}
