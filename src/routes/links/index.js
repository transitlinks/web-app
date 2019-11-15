import { getLog } from '../../core/log';
const log = getLog('routes/discover');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Links from './Links';

export default {

  path: '/links',

  async action({ params, query, context }) {

    const paramKeys = Object.keys(query);
    const paramsStringElems = paramKeys.map(paramKey => `${paramKey}: "${query[paramKey]}"`);
    const paramsString = paramsStringElems.join(', ');
    const { graphqlRequest } = context.store.helpers;

    try {

      const { data } = await graphqlRequest(
        `query {
          transitLinks (${paramsString}) {
            uuid,
            transport,
            transportId,
            from {
              latitude,
              longitude,
              locality,
              formattedAddress
            },
            to {
              latitude,
              longitude,
              locality,
              formattedAddress
            }
          },
          transportTypes { slug }
        }`
      );

      log.info("event=received-transit-links-data", data);
      return <Links links={data.transitLinks} params={query} transportTypes={data.transportTypes} />;

    } catch (error) {
      log.info("error=route-transit-links", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
