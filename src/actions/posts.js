import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import { geocode, extractPlaceFields } from '../services/linkService';

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

    const location = await geocodeCheckIn();

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

    console.log("geocoded location", location);

    const placeFields = extractPlaceFields(location);

    const query = `
      mutation saveCheckIn {
        checkIn(checkIn:${toGraphQLObject({ ...placeFields, ...checkIn })}) {
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

    const query = `
      mutation deleteCheckIn {
        deleteCheckIn(checkInUuid:"${checkInUuid}") {
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

  return async (...args) => {

    const query = `
      mutation savePost {
        post(post:${toGraphQLObject(post)}) {
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

  return async (...args) => {

    const query = `
      mutation saveTerminal {
        terminal(terminal:${toGraphQLObject(terminal)}) {
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

export const getFeed = (clientId) => {

  return async (...args) => {

    const query = `
      query {
        feed (clientId:"${clientId}") {
          feedItems {
            checkIn {
              uuid,
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

export const getFeedItem = (checkInUuid, replaceIndex) => {

  return async (...args) => {

    const query = `
      query {
        feedItem (checkInUuid:"${checkInUuid}") {
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
      { query, variables: { checkInUuid, replaceIndex } }, [ 'feedItem' ],
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
