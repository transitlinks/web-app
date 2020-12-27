import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
import { geocode, extractPlaceFields } from '../services/linkService';
import { getClientId } from "../core/utils";
import { createQuery, getFeedItemQuery, getFeedItemsQuery } from '../data/queries/queries';

import {
  SAVE_CHECKIN_START,
  SAVE_CHECKIN_SUCCESS,
  SAVE_CHECKIN_ERROR,
  DELETE_CHECKIN_START,
  DELETE_CHECKIN_SUCCESS,
  DELETE_CHECKIN_ERROR,
  GET_FEED_START,
  GET_FEED_SUCCESS,
  GET_FEED_ERROR,
  GET_FEEDITEM_START,
  GET_FEEDITEM_SUCCESS,
  GET_FEEDITEM_ERROR,
  SELECTED_ADDRESS,
} from '../constants';

export const saveCheckIn = ({ checkIn }) => {

  return async (...args) => {

    let completedCheckIn = checkIn;
    if (checkIn.latitude && checkIn.longitude) {

      const geocodeCheckInLocation = async () => {
        return new Promise((resolve, reject) => {
          geocode({ lat: checkIn.latitude, lng: checkIn.longitude }, (location) => {
            resolve(location);
          })
        });
      };

      const checkInLocation = await geocodeCheckInLocation();
      completedCheckIn.locality = checkInLocation.locality;
      completedCheckIn.adminArea1 = checkInLocation.adminArea1;
      completedCheckIn.adminArea2 = checkInLocation.adminArea2;
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
          likes,
          likedByUser,
          departure {
            uuid,
            localDateTime,
            locality,
            formattedAddress,
            transport
          }
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

export const deleteCheckIn = (uuid, nextUrl) => {

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
          formattedAddress,
          nextUrl
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query, variables: { nextUrl } }, [ 'deleteCheckIn' ],
      DELETE_CHECKIN_START,
      DELETE_CHECKIN_SUCCESS,
      DELETE_CHECKIN_ERROR
    );

  };

};

export const getFeed = (clientId, params) => {

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
          ${getFeedItemsQuery()},
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
          userImage,
          tripName
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

};

export const getFeedItem = (checkInUuid, frameId, noLoading) => {

  return async (...args) => {

    const query = createQuery([getFeedItemQuery(checkInUuid)]);

    return graphqlAction(
      ...args,
      { query, variables: { checkInUuid, frameId, noLoading } }, [ 'feedItem' ],
      GET_FEEDITEM_START,
      GET_FEEDITEM_SUCCESS,
      GET_FEEDITEM_ERROR
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
