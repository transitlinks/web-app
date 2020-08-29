import { toGraphQLObject } from '../core/utils';
import { graphqlAction } from './utils';
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
  DELETE_POST_START,
  DELETE_POST_SUCCESS,
  DELETE_POST_ERROR,
  DELETE_TERMINAL_START,
  DELETE_TERMINAL_SUCCESS,
  DELETE_TERMINAL_ERROR,
  MEDIA_FILE_UPLOAD_START,
  MEDIA_FILE_UPLOAD_SUCCESS,
  MEDIA_FILE_UPLOAD_ERROR,
  GET_DISCOVER_START,
  GET_DISCOVER_SUCCESS,
  GET_DISCOVER_ERROR,
  GET_MEDIAITEM_START,
  GET_MEDIAITEM_SUCCESS,
  GET_MEDIAITEM_ERROR, DELETE_MEDIAITEM_START, DELETE_MEDIAITEM_SUCCESS, DELETE_MEDIAITEM_ERROR,
} from '../constants';

export const deletePost = (uuid) => {

  return async (...args) => {


    const clientId = getClientId();

    const query = `
      mutation deletePost {
        deletePost(uuid:"${uuid}", clientId:"${clientId}") {
          uuid,
          checkInUuid
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'deletePost' ],
      DELETE_POST_START,
      DELETE_POST_SUCCESS,
      DELETE_POST_ERROR
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
          checkInUuid,
          text,
          mediaItems {
            uuid,
            type,
            url,
            latitude,
            longitude,
            date
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
            url,
            latitude,
            longitude,
            date
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

};

export const deleteTerminal = (uuid) => {

  return async (...args) => {


    const clientId = getClientId();

    const query = `
      mutation deleteTerminal {
        deleteTerminal(uuid:"${uuid}", clientId:"${clientId}") {
          uuid,
          checkInUuid
        }
      }
    `;

    return graphqlAction(
      ...args,
      { query }, [ 'deleteTerminal' ],
      DELETE_TERMINAL_START,
      DELETE_TERMINAL_SUCCESS,
      DELETE_TERMINAL_ERROR
    );

  };

};

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
                  country,
                  tags,
                  likes,
                  likedByUser
                },
                inbound {
                  uuid,
                  latitude,
                  longitude,
                  formattedAddress,
                  tags
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
                  url,
                  latitude,
                  longitude,
                  date
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

};

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
