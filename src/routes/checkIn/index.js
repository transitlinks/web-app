import { getLog } from '../../core/log';
const log = getLog('routes/checkIn');

import React from 'react';
import CheckIn from './CheckIn';
import ErrorPage from '../../components/common/ErrorPage';
import { createQuery, getFeedItemQuery } from '../../data/queries/queries';
import { getClientId } from '../../core/utils';

export default {

  path: '/check-in/:uuid',

  async action({ params, context }) {

    const { graphqlRequest } = context.store.helpers;

    let userUuid = null;
    const state = context.store.getState();
    const { auth } = state.auth;
    if (auth.loggedIn) {
      userUuid = auth.user.uuid;
    }

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
          }`
        ]);

        const { data } = await graphqlRequest(query);

        log.info("event=received-check-in", "data:", data);

        const edit = params.action === 'edit';
        const { feedItem, transportTypes, openTerminals } = data;
        feedItem.fetchedAt = (new Date()).getTime();

        const props = {
          edit,
          feedItem,
          transportTypes,
          openTerminals
        };

        return <CheckIn {...props} />;

      } else {

        const { data } = await graphqlRequest(createQuery(['transportTypes { slug }']));

        return <CheckIn edit={true}
          checkIn={{}}
          transportTypes={data.transportTypes} />;

      }


    } catch (error) {
      log.error(error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
