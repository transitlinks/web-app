import { getLog } from '../../core/log';
const log = getLog('routes/discover');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Discover from './Discover';

export default {

  path: '/discover/:search?/:type?',

  async action({ params, context }) {
    
    let search = params.search;
    let type = params.type;

    const { graphqlRequest } = context.store.helpers;
 
    try { 

      const { data } = await graphqlRequest(
        `query {
          discover (search: "${search}", type: "${type}") {
            discoveries {
              groupType,
              groupName,
              posts {
                uuid,
                text,
                user,
                mediaItems {
                  uuid,
                  type,
                  url
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
      );

      log.info("event=received-discoveries-data", data);
      return <Discover discover={data.discover} />;
    
    } catch (error) {
      log.info("error=route-discover", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
