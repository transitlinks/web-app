import { getLog } from '../../core/log';
const log = getLog('routes/home');

import React from 'react';
import Home from './Home';
import fetch from '../../core/fetch';
import TransitLink from "../link";
import ErrorPage from '../../components/common/ErrorPage';

export default {

  path: '/',

  async action({ params, context, query }) {

    const { graphqlRequest } = context.store.helpers;

    try {

      const { data } = await graphqlRequest(
        `query {
          feed(input: "${'test'}") {
            feedItems {
              checkIn {
                uuid,
                latitude,
                longitude
              },
              posts {
                uuid,
                text
              }
            }
          }
        }`
      );

      log.info('event=received-feed-data', data);
      return <Home feed={data.feed} />;

    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }


  }


};
