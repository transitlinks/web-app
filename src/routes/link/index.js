import { getLog } from '../../core/log';
const log = getLog('routes/link');

import React from 'react';
import TransitLink from './TransitLink';
import ErrorPage from '../../components/common/ErrorPage';
import { resetLink } from '../../actions/editLink';
import fetch from '../../core/fetch';

export default {

  path: '/link/:uuid',

  async action({ params, context }) {
      
    const { graphqlRequest } = context.store.helpers;
      
    try { 
      
      const { data } = await graphqlRequest(
        `query {
          link(uuid: "${params.uuid}") {
            uuid,
            from { description, lat, lng },
            to { description, lat, lng },
            instances {
              uuid,
              transport { slug },
              priceAmount, priceCurrency,
              avgRating,
              durationMinutes
            }
          }
        }`
      );
      
      log.info('event=received-link-data', data);
      return <TransitLink link={data.link} />; 
    
    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }

  }

};
