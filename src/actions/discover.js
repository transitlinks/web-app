import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import { geocode, extractPlaceFields } from '../services/linkService';
import { createParamString } from "../core/utils";
import {
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR
} from '../constants';

export const getDiscoveries = (params, reset) => {

  return async (...args) => {

    const query = `query {
          discover ${createParamString(params)} {
            discoveries {
              groupType,
              groupName,
              checkInCount,
              feedItem {
                checkIn {
                  uuid,
                  user,
                  userUuid,
                  userImage,
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
                  uuid
                }
              },
              connectionsFrom,
              connectionsTo
            }
          }
        }`

    return graphqlAction(
      ...args,
      { query, variables: { reset } }, [ 'discover' ],
      GET_DISCOVER_START,
      GET_DISCOVER_SUCCESS,
      GET_DISCOVER_ERROR
    );

  };

}
