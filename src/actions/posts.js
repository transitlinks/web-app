import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import { geocode, extractPlaceFields } from '../services/linkService';
import { getClientId } from "../core/utils";

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
  INSTANCE_FILE_UPLOAD_START,
  INSTANCE_FILE_UPLOAD_SUCCESS,
  INSTANCE_FILE_UPLOAD_ERROR
} from '../constants';

export const saveCheckIn = ({ checkIn }) => {

  const geocodeCheckIn = async () => {
    return new Promise((resolve, reject) => {
      geocode({ lat: checkIn.latitude, lng: checkIn.longitude }, (location) => {
        resolve(location);
      })
    });
  };

  return async (...args) => {

    let placeFields = {};

    if (checkIn.latitude && checkIn.longitude) {
      const location = await geocodeCheckIn();
      console.log("geocoded location", location);
      placeFields = extractPlaceFields(location);
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
        checkIn(checkIn:${toGraphQLObject({ ...placeFields, ...checkIn })}, clientId:"${clientId}") {
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
      SAVE_CHECKIN_START,
      SAVE_CHECKIN_SUCCESS,
      SAVE_CHECKIN_ERROR
    );

  };

};

export const deleteCheckIn = ({ checkInUuid }) => {

  return async (...args) => {


    const clientId = getClientId();

    const query = `
      mutation deleteCheckIn {
        deleteCheckIn(checkInUuid:"${checkInUuid}", clientId:"${clientId}") {
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
          text
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
          date,
          time,
          priceAmount,
          priceCurrency,
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

export const getFeed = (clientId) => {

  return async (...args) => {

    const query = `
      query {
        feed (clientId:"${clientId}") {
          feedItems {
            checkIn {
              uuid,
              clientId,
              user,
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
              date,
              time,
              priceAmount,
              priceCurrency,
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
          openTerminals {
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
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'feed' ],
      GET_FEED_START,
      GET_FEED_SUCCESS,
      GET_FEED_ERROR
    );

  };

}

export const getFeedItem = (checkInUuid, frameId, target) => {

  return async (...args) => {

    const query = `
      query {
        feedItem (checkInUuid:"${checkInUuid}") {
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
            date,
            time,
            priceAmount,
            priceCurrency,
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
    `;

    return graphqlAction(
      ...args,
      { query, variables: { checkInUuid, frameId, target } }, [ 'feedItem' ],
      GET_FEEDITEM_START,
      GET_FEEDITEM_SUCCESS,
      GET_FEEDITEM_ERROR
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
          url
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query, files }, [ 'mediaItem' ],
      MEDIA_FILE_UPLOAD_START,
      MEDIA_FILE_UPLOAD_SUCCESS,
      MEDIA_FILE_UPLOAD_ERROR
    );

  };

};
