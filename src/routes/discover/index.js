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
              checkInCount,
              feedItem {
                checkIn {
                  uuid,
                  user,
                  date,
                  latitude,
                  longitude
                  placeId,
                  formattedAddress,
                  locality,
                  country
                },
                inbound {
                  uuid,
                  latitude,
                  longitude,
                  formattedAddress
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
                    url
                  }
                },
                terminals {
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
              },
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
              connectionsFrom,
              connectionsTo
            }
          },
          transportTypes { slug }
        }`
      );

      log.info("event=received-discoveries-data", data);
      return <Discover discover={data.discover} transportTypes={data.transportTypes} />;

    } catch (error) {
      log.info("error=route-discover", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
