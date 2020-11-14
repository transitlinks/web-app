import { getLog } from '../../core/log';
const log = getLog('routes/checkIn');

import React from 'react';
import CheckIn from './CheckIn';
import ErrorPage from '../../components/common/ErrorPage';
import {
  createQuery,
  getActiveTripQuery,
  getFeedItemQuery,
  getTripEntity,
} from '../../data/queries/queries';

export default {

  path: '/check-in/:uuid',

  async action({ params, query, context }) {

    const { graphqlRequest } = context.store.helpers;

    let userUuid = null;
    const state = context.store.getState();
    const { auth } = state.auth;
    if (auth.loggedIn) {
      userUuid = auth.user.uuid;
    }

    const { view } = query;

    try {

      if (params.uuid) {

        const query = createQuery([
          getFeedItemQuery(params.uuid),
          'transportTypes { slug }',
          `openTerminals {
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
          }`,
          getActiveTripQuery()
        ]);

        const { data } = await graphqlRequest(query);

        log.info("event=received-check-in", "data:", data);

        const edit = params.action === 'edit';
        const { feedItem, transportTypes, openTerminals, activeTrip } = data;
        feedItem.fetchedAt = (new Date()).getTime();

        const props = {
          edit,
          feedItem,
          transportTypes,
          openTerminals,
          activeTrip,
          view
        };

        return <CheckIn {...props} />;

      } else {

        const { data } = await graphqlRequest(createQuery(['transportTypes { slug }']));

        return <CheckIn edit={true}
          checkIn={{}}
          transportTypes={data.transportTypes}
          activeTrip={data.activeTrip} />;

      }


    } catch (error) {
      log.error(error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
