import { getLog } from '../../core/log';
const log = getLog('routes/links');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Links from './Links';
import { createParamString } from '../../core/utils';

export default {

  path: '/links',

  async action({ params, query, context }) {

    const paramKeys = Object.keys(query);
    const paramsString = createParamString(query);
    const { graphqlRequest } = context.store.helpers;

    console.log('LINKS ROUTE', query, paramsString);

    try {

      const { data } = await graphqlRequest(
        `query {
          transitLinks ${paramsString} {
            searchResultType,
            locality,
            linkedLocality,
            links {
              locality,
              latitude,
              longitude,
              departures {
                type,
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
                linkCount,
                reverseLinkCount,
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
                route { lat, lng }
              },
              arrivals {
                type,
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
                linkCount,
                reverseLinkCount,
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
                route { lat, lng }
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
                linkCount,
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
                route { lat, lng }
              },
              departureCount,
              arrivalCount,
              linkedDepartures {
                locality,
                linkedLocality,
                linkedTerminalType,
                linkedTerminalUuid,
                linkedLocalityLatitude,
                linkedLocalityLongitude,
                linkCount
              },
              linkedArrivals {
                locality,
                linkedLocality,
                linkedTerminalType,
                linkedTerminalUuid,
                linkedLocalityLatitude,
                linkedLocalityLongitude,
                linkCount
              }
            }
          },
          transportTypes { slug }
        }`
      );

      log.info("event=received-transit-links-data", data);
      return <Links linksResult={data.transitLinks} updated={(new Date().getTime())} query={query} transportTypes={data.transportTypes} />;

    } catch (error) {
      log.info("error=route-transit-links", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
