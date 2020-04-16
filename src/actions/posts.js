import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import { geocode, extractPlaceFields } from '../services/linkService';
import { getClientId } from "../core/utils";
import { createQuery, getFeedItemQuery } from '../data/queries/queries';

import {
  SAVE_POST_START,
  SAVE_POST_SUCCESS,
  SAVE_POST_ERROR,
  GET_POSTS_START,
  GET_POSTS_SUCCESS,
  GET_POSTS_ERROR,
  SAVE_TERMINAL_START,
  SAVE_TERMINAL_SUCCESS,
  SAVE_TERMINAL_ERROR,
  GET_TERMINALS_START,
  GET_TERMINALS_SUCCESS,
  GET_TERMINALS_ERROR,
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  DELETE_CHECKIN_START,
  DELETE_CHECKIN_SUCCESS,
  DELETE_CHECKIN_ERROR,
  MEDIA_FILE_UPLOAD_START,
  MEDIA_FILE_UPLOAD_SUCCESS,
  MEDIA_FILE_UPLOAD_ERROR,
  GET_FEED_START,
  GET_FEED_SUCCESS,
  GET_FEED_ERROR,
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR,
  GET_FEEDITEM_START,
  GET_FEEDITEM_SUCCESS,
  GET_FEEDITEM_ERROR,
  GET_MEDIAITEM_START,
  GET_MEDIAITEM_SUCCESS,
  GET_MEDIAITEM_ERROR,
} from '../constants';

export const saveCheckIn = ({ checkIn }) => {

  const geocodeCheckInLocation = async () => {
    return new Promise((resolve, reject) => {
      geocode({ lat: checkIn.latitude, lng: checkIn.longitude }, (location) => {
        resolve(location);
      })
    });
  };

  return async (...args) => {

    let completedCheckIn = checkIn;
    if (checkIn.latitude && checkIn.longitude) {
      const checkInLocation = await geocodeCheckInLocation();
      completedCheckIn.locality = checkInLocation.locality;
      completedCheckIn.country = checkInLocation.country;
      console.log('geocoded locality', checkInLocation);
    }


    /*
    const location = {
      formatted_address: 'Dizengoff Str.',
      place_id: '209091809',
      address_components: [
        {
          types: 'locality',
          long_name: 'Tel Aviv',
        },
        {
          types: 'country',
          long_name: 'Israel',
        }
      ]
    };
    */

    const clientId = getClientId();

    const query = `
      mutation saveCheckIn {
        checkIn(checkIn:${toGraphQLObject(completedCheckIn)}, clientId:"${clientId}") {
          uuid,
          userUuid,
          userImage,
          latitude,
          longitude,
          placeId,
          locality,
          country,
          formattedAddress
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'checkIn' ],
      SAVE_CHECKIN_START,
      SAVE_CHECKIN_SUCCESS,
      SAVE_CHECKIN_ERROR
    );

  };

};

export const deleteCheckIn = (uuid) => {

  return async (...args) => {


    const clientId = getClientId();

    const query = `
      mutation deleteCheckIn {
        deleteCheckIn(checkInUuid:"${uuid}", clientId:"${clientId}") {
          uuid,
          latitude,
          longitude,
          placeId,
          locality,
          country,
          formattedAddress
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'checkIn' ],
      DELETE_CHECKIN_START,
      DELETE_CHECKIN_SUCCESS,
      DELETE_CHECKIN_ERROR
    );

  };

};

export const savePost = ({ post }) => {

  const clientId = getClientId();

  return async (...args) => {

    const query = `
      mutation savePost {
        post(post:${toGraphQLObject(post)}, clientId:"${clientId}") {
          uuid,
          text,
          mediaItems {
            uuid,
            type,
            url
          }
        }
      }
    `;

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

  return async (...args) => {

    const query = `
      query {
        posts (input:"${input}") {
          uuid,
          text,
          user,
          mediaItems {
            uuid,
            type,
            url
          }
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

export const saveTerminal = ({ terminal }) => {

  const clientId = getClientId();

  return async (...args) => {

    const query = `
      mutation saveTerminal {
        terminal(terminal:${toGraphQLObject(terminal)}, clientId:"${clientId}") {
          uuid,
          type,
          transport,
          transportId,
          description,
          date,
          time,
          priceAmount,
          priceCurrency
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'terminal' ],
      SAVE_TERMINAL_START,
      SAVE_TERMINAL_SUCCESS,
      SAVE_TERMINAL_ERROR
    );

  };

}

export const getTerminals = (checkInId) => {

  return async (...args) => {

    const query = `
      query {
        terminals (checkInId:"${checkInId}") {
          uuid,
          type,
          transport,
          transportId,
          description,
          date,
          time,
          priceAmount,
          priceCurrency,
          linkedTerminal {
            uuid,
            type,
            transport,
            transportId,
            description,
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
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'terminals' ],
      GET_TERMINALS_START,
      GET_TERMINALS_SUCCESS,
      GET_TERMINALS_ERROR
    );

  };

}

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
                  userUuid,
                  userImage,
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
                  description,
                  date,
                  time,
                  priceAmount,
                  priceCurrency
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
                description,
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
                  description,
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
                description,
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
                  description,
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

export const getFeed = (clientId, params) => {

  let paramsString = `clientId: "${clientId}"`;
  const { add, offset, limit } = params;
  delete params.add;
  const paramKeys = Object.keys(params);
  paramKeys.forEach(key => {
    const val = isNaN(params[key]) ? `"${params[key]}"` : params[key];
    paramsString += `, ${key}: ${val}`;
  });

  return async (...args) => {

    const query = `
      query {
        feed (${paramsString}) {
          feedItems {
            checkIn {
              uuid,
              clientId,
              user,
              userUuid,
              userImage,
              date,
              latitude,
              longitude,
              placeId,
              formattedAddress,
              locality,
              country
            },
            inbound {
              uuid,
              latitude,
              longitude,
              placeId,
              formattedAddress,
              locality,
              country
            },
            outbound {
              uuid,
              latitude,
              longitude,
              placeId,
              formattedAddress,
              locality,
              country
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
              description,
              date,
              time,
              priceAmount,
              priceCurrency,
              linkedTerminal {
                uuid,
                type,
                transport,
                transportId,
                description,
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
          openTerminals {
            uuid,
            type,
            transport,
            transportId,
            description,
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
    `;

    return graphqlAction(
      ...args,
      { query, variables: { add, offset, limit } }, [ 'feed' ],
      GET_FEED_START,
      GET_FEED_SUCCESS,
      GET_FEED_ERROR
    );

  };

}

export const getFeedItem = (checkInUuid, frameId, target) => {

  return async (...args) => {

    const query = createQuery([getFeedItemQuery(checkInUuid)]);

    return graphqlAction(
      ...args,
      { query, variables: { checkInUuid, frameId, target } }, [ 'feedItem' ],
      GET_FEEDITEM_START,
      GET_FEEDITEM_SUCCESS,
      GET_FEEDITEM_ERROR
    );

  };

}


export const getMediaItem = (uuid) => {

  return async (...args) => {

    const query = `
      query {
        mediaItem (uuid:"${uuid}") {
          uuid,
          url,
          type,
          thumbnail,
          uploadStatus,
          uploadProgress,
          fileSize
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'mediaItem' ],
      GET_MEDIAITEM_START,
      GET_MEDIAITEM_SUCCESS,
      GET_MEDIAITEM_ERROR
    );

  };

}

export const uploadFiles = (mediaItem, files) => {

  return async (...args) => {

    const query = `
      mutation uploadMedia {
        mediaItem(mediaItem:${toGraphQLObject(mediaItem)}) {
          uuid,
          type,
          thumbnail,
          url,
          uploadStatus,
          fileSize,
          uploadProgress
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query, files, variables: { files } }, [ 'mediaItem' ],
      MEDIA_FILE_UPLOAD_START,
      MEDIA_FILE_UPLOAD_SUCCESS,
      MEDIA_FILE_UPLOAD_ERROR
    );

  };

};
