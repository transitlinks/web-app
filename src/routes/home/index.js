import { getLog } from '../../core/log';
const log = getLog('routes/home');

import React from 'react';
import Home from './Home';
import ErrorPage from '../../components/common/ErrorPage';
import {getClientId, createParamString} from "../../core/utils";

export default {

  path: ['/'],

  async action({ params, context, query }) {

    const { graphqlRequest } = context.store.helpers;
    const clientId = getClientId();
    const { frame } = query;
    if (frame) delete query.frame;
    const { tags, user, locality } = query;
    const queryParams = { clientId, limit: 8, ...query };

    const { type, uuid } = params;

    let contentQuery = '';
    if (type === 'post') {
      contentQuery = `
        post (uuid: "${uuid}") {
          uuid,
          text,
          user,
          checkInUuid,
          mediaItems {
            uuid,
            type,
            url,
            latitude,
            longitude
          }
        }
      `;
    }

    const paramsString = createParamString(queryParams);

    try {

      const { data } = await graphqlRequest(
        `query {
          feed${paramsString} {
            feedItems {
              checkIn {
                uuid,
                clientId,
                user,
                userUuid,
                userImage,
                date,
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
                  longitude
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
          },
          transportTypes { slug },
          ${contentQuery}
        }`
      );

      const { feed, transportTypes, post } = data;
      log.info('event=received-feed-data', 'query=', query, data);

      if (user || tags || locality) {
        feed.query = { user, tags, locality };
      }

      return <Home feed={feed} query={query} transportTypes={transportTypes} post={post} frame={frame} />;

    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }


  }


};
