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
    let paramsString = paramsStringElems.join(', ');
    const { graphqlRequest } = context.store.helpers;

    if (paramsString.length > 0) {
      paramsString = '(' + paramsString + ')';
    }

    try {

      const { data } = await graphqlRequest(
        `query {
          transitLinks ${paramsString} {
            locality,
            latitude,
            longitude,
            departures {
              latitude,
              longitude,
              locality,
              transport,
              transportId,
              priceAmount,
              priceCurrency,
              date,
              time,
              checkInUuid,
              formattedAddress,
              description,
              linkedTerminal {
                latitude,
                longitude,
                locality,
                transport,
                transportId,
                priceAmount,
                priceCurrency,
                date,
                time,
                checkInUuid,
                formattedAddress,
                description
              }
            },
            arrivals {
              latitude,
              longitude,
              locality,
              transport,
              transportId,
              priceAmount,
              priceCurrency,
              date,
              time,
              checkInUuid,
              formattedAddress,
              description,
              linkedTerminal {
                latitude,
                longitude,
                locality,
                transport,
                transportId,
                priceAmount,
                priceCurrency,
                date,
                time,
                checkInUuid,
                formattedAddress,
                description
              }
            },
            internal {
              latitude,
              longitude,
              locality,
              transport,
              transportId,
              priceAmount,
              priceCurrency,
              date,
              time,
              checkInUuid,
              formattedAddress,
              description,
              linkedTerminal {
                latitude,
                longitude,
                locality,
                transport,
                transportId,
                priceAmount,
                priceCurrency,
                date,
                time,
                checkInUuid,
                formattedAddress,
                description
              }
            }
          },
          transportTypes { slug }
        }`
      );

      log.info("event=received-transit-links-data", data);
      return <Links links={data.transitLinks} query={query} transportTypes={data.transportTypes} />;

    } catch (error) {
      log.info("error=route-transit-links", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
