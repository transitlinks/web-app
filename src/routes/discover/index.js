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
              group,
              posts {
                uuid
              },
              departures {
                uuid
              },
              arrivals {
                uuid
              }
            }
          }
        }`
      );

      log.info("event=received-discoveries-data", data);
      return <Discover discoveries={data.discoveries} />;
    
    } catch (error) {
      log.info("error=route-discover", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
