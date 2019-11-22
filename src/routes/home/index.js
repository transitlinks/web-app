import { getLog } from '../../core/log';
const log = getLog('routes/home');

import React from 'react';
import Home from './Home';
import fetch from '../../core/fetch';
import TransitLink from "../link";
import ErrorPage from '../../components/common/ErrorPage';
import {getClientId} from "../../core/utils";

export default {

  path: '/',

  async action({ params, context, query }) {

    const { graphqlRequest } = context.store.helpers;
    const clientId = getClientId();
    let paramsString = `clientId: "${clientId}"`;
    if (query.tags) {
      paramsString += `, tags: "${query.tags}"`;
    }

    try {

      const { data } = await graphqlRequest(
        `query {
          feed(${paramsString}) {
            feedItems {
              checkIn {
                uuid,
                clientId,
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
                placeId,
                formattedAddress,
                locality,
                country
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
                priceCurrency
              }
            },
            openTerminals {
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
          transportTypes { slug }
        }`
      );

      log.info('event=received-feed-data', data);
      return <Home feed={data.feed} transportTypes={data.transportTypes} tags={query.tags}/>;

    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }


  }


};
