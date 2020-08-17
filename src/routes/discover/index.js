import { getLog } from '../../core/log';
const log = getLog('routes/discover');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Discover from './Discover';
import { createParamString } from '../../core/utils';
import { getDiscoverQuery, getFeedItemQuery } from '../../data/queries/queries';

export default {

  path: '/discover',

  async action({ params, context }) {

    const { graphqlRequest } = context.store.helpers;

    try {

      const { data } = await graphqlRequest(
        `query {
          ${getDiscoverQuery({ ...params, offset: 0, limit: 6 })},
          transportTypes { slug }
        }`
      );

      log.info('event=received-discoveries-data', data);
      return <Discover discover={data.discover} transportTypes={data.transportTypes} />;

    } catch (error) {
      log.info('error=route-discover', error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
