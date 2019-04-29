import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import { geocode, extractPlaceFields } from '../services/linkService';

import {
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR
} from '../constants';

export const getDiscoveries = (search, type) => {

  return async (...args) => {

    const query = `query {
          discover (search: "${search}", type: "${type}") {
            discoveries {
              groupType,
              groupName,
              checkInCount,
              feedItem {
                checkIn {
                  uuid,
                  user,
                  date,
                  latitude,
                  longitude
                  placeId,
                  formattedAddress,
                  locality,
                  country
                },
                inbound {
                  uuid,
                  latitude,
                  longitude,
                  formattedAddress
                },
                outbound {
                  uuid,
                  latitude,
                  longitude,
                  formattedAddress
                },
                posts {
                  uuid,
                  text,
                  user,
                  mediaItems {
                    uuid,
                    type,
                    url
                  }
                },
                terminals {
                  uuid,
                  type,
                  transport,
                  transportId,
                  date,
                  time,
                  priceAmount,
                  priceCurrency,
                  checkIn {
                    uuid,
                    formattedAddress,
                    locality
                  },
                  linkedTerminal {
                    uuid,
                    type,
                    transport,
                    transportId,
                    date,
                    time,
                    priceAmount,
                    priceCurrency,
                    checkIn {
                      uuid,
                      latitude,
                      longitude,
                      placeId,
                      formattedAddress,
                      locality,
                      country
                    }
                  }
                }
              },
              posts {
                uuid,
                text,
                user,
                mediaItems {
                  uuid,
                  type,
                  url
                },
                checkIn {
                  uuid,
                  formattedAddress
                }
              },
              departures {
                uuid,
                type,
                transport,
                transportId,
                date,
                time,
                priceAmount,
                priceCurrency,
                checkIn {
                  uuid,
                  formattedAddress,
                  locality
                },
                linkedTerminal {
                  uuid,
                  type,
                  transport,
                  transportId,
                  date,
                  time,
                  priceAmount,
                  priceCurrency,
                  checkIn {
                    uuid,
                    latitude,
                    longitude,
                    placeId,
                    formattedAddress,
                    locality,
                    country
                  }
                }
              },
              arrivals {
                uuid,
                type,
                transport,
                transportId,
                date,
                time,
                priceAmount,
                priceCurrency,
                checkIn {
                  uuid,
                  formattedAddress,
                  locality
                },
                linkedTerminal {
                  uuid,
                  type,
                  transport,
                  transportId,
                  date,
                  time,
                  priceAmount,
                  priceCurrency,
                  checkIn {
                    uuid,
                    latitude,
                    longitude,
                    placeId,
                    formattedAddress,
                    locality,
                    country
                  }
                }
              }
            }
          }
        }`

    return graphqlAction(
      ...args,
      { query }, [ 'discover' ],
      GET_DISCOVER_START,
      GET_DISCOVER_SUCCESS,
      GET_DISCOVER_ERROR
    );

  };

}
