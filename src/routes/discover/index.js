import { getLog } from '../../core/log';
const log = getLog('routes/discover');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Discover from './Discover';
import { createParamString } from '../../core/utils';
import { getActiveTripQuery, getDiscoverQuery } from '../../data/queries/queries';

export default {

  path: '/discover',

  async action({ params, context }) {

    const { graphqlRequest } = context.store.helpers;
    //${getDiscoverQuery({ ...params, offset: 0, limit: 6 })}

    try {

      const { data } = await graphqlRequest(
        `query {,
          transportTypes { slug },
          ${getActiveTripQuery()}
        }`
      );

      log.info('event=received-discoveries-data', data);
      return <Discover discover={data.discover} transportTypes={data.transportTypes} activeTrip={data.activeTrip} />;

    } catch (error) {
      log.info('error=route-discover', error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
