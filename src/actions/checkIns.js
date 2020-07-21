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
  DELETE_POST_START,
  DELETE_POST_SUCCESS,
  DELETE_POST_ERROR,
  DELETE_TERMINAL_START,
  DELETE_TERMINAL_SUCCESS,
  DELETE_TERMINAL_ERROR,
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
  DELETE_MEDIAITEM_START,
  DELETE_MEDIAITEM_SUCCESS,
  DELETE_MEDIAITEM_ERROR,
  SELECTED_ADDRESS,
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
      if (checkIn.exif) {
        completedCheckIn.formattedAddress = checkInLocation.result.formatted_address;
        delete completedCheckIn.exif;
      }
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
          date,
          userUuid,
          userImage,
          latitude,
          longitude,
          placeId,
          locality,
          country,
          formattedAddress,
          tags,
          likes
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


export const getFeed = (clientId, params) => {

  console.log('feed params', params);
  let paramsString = `clientId: "${clientId}"`;
  const { add, offset, limit, user, tags, locality } = params;

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
              country,
              tags,
              likes
            },
            inbound {
              uuid,
              latitude,
              longitude,
              placeId,
              formattedAddress,
              locality,
              country,
              tags
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
                url,
                latitude,
                longitude,
                date
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
          },
          user,
          userImage
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query, variables: { add, offset, limit, user, tags, locality } }, [ 'feed' ],
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
          fileSize,
          longitude,
          latitude,
          date
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
          uploadProgress,
          longitude,
          latitude,
          date
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

export const deleteMediaItem = (mediaItemUuid) => {

  return async (...args) => {

    const query = `
      mutation deleteMediaItem {
        deleteMediaItem(mediaItemUuid:"${mediaItemUuid}") {
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
      { query }, [ 'deleteMediaItem' ],
      DELETE_MEDIAITEM_START,
      DELETE_MEDIAITEM_SUCCESS,
      DELETE_MEDIAITEM_ERROR
    );

  };

};

export function selectAddress({ endpoint, locality }) {

  return async (dispatch, getState) => {

    dispatch({
      type: SELECTED_ADDRESS,
      payload: {
        endpoint,
        locality
      },
    });

    return true;

  };

}
