import { getLog } from '../../core/log';
const log = getLog('routes/links');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Links from './Links';
import { createParamString } from '../../core/utils';
import { getLinksQuery } from '../../data/queries/queries';

export default {

  path: '/links',

  async action({ params, query, context }) {

    const { graphqlRequest } = context.store.helpers;

    try {

      const { data } = await graphqlRequest(
        `query {
          ${getLinksQuery(query)},
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
