import { getLog } from '../../core/log';
const log = getLog('routes/discover');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Links from './Links';

export default {

  path: '/links/:locality?/:type?',

  async action({ params, context }) {

    let locality = params.locality;
    let type = params.type;

    const { graphqlRequest } = context.store.helpers;

    try {

      const { data } = await graphqlRequest(
        `query {
          terminals (locality: "${locality}", type: "${type}") {
            uuid
          },
          transportTypes { slug }
        }`
      );

      log.info("event=received-terminals-data", data);
      return <Links terminals={data.terminals} transportTypes={data.transportTypes} />;

    } catch (error) {
      log.info("error=route-discover", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
