import { getLog } from '../../core/log';
const log = getLog('routes/home');

import React from 'react';
import Home from './Home';
import ErrorPage from '../../components/common/ErrorPage';
import {getClientId, createParamString} from "../../core/utils";
import { getActiveTripQuery, getFeedItemsQuery, getTripEntity } from '../../data/queries/queries';

export default {

  path: ['/'],

  async action({ params, context, query }) {

    const { graphqlRequest } = context.store.helpers;

    const { frame } = query;

    if (frame) delete query.frame;
    const { tags, trip, user, locality } = query;

    const queryParams = { limit: 8, ...query };

    const state = context.store.getState();

    const { auth } = state.auth;
    let uuid = null;
    if (auth.loggedIn) {
      uuid = auth.user.uuid;
    }

    const paramsString = createParamString(queryParams);
    //${getFeedItemsQuery()},

    try {

      const { data } = await graphqlRequest(
        `query {
          feed${paramsString} {
            openTerminals {
              uuid,
              type,
              transport,
              transportId,
              description,
              localDateTime,
              utcDateTime,
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
            user {
              uuid,
              username,
              firstName,
              lastName,
              photo,
              avatar,
              avatarSource
            },
            userImage,
            locality,
            linkedLocality,
            tripName,
            from,
            to
          },
          transportTypes { slug },
          ${getActiveTripQuery()},
          ${uuid ? `profile (uuid: "${uuid}") {
            uuid,
            email,
            username,
            photo,
            avatar,
            avatarSource,
            avatarX,
            avatarY,
            avatarScale,
            logins
          }` : ''}
        }`
      );

      const { profile, feed, transportTypes, post, activeTrip } = data;
      log.info('event=received-feed-data', 'query=', query, data);

      if (user || tags || trip || locality) {
        feed.query = { user, tags, trip, locality };
      }

      feed.fetchedAt = (new Date()).getTime();

      return <Home profile={profile} feed={feed} query={query} transportTypes={transportTypes} post={post} frame={frame} activeTrip={activeTrip} />;

    } catch (error) {
      return <ErrorPage errors={error.errors} />;
    }


  }


};
