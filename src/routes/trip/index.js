import { getLog } from '../../core/log';
const log = getLog('routes/trip');

import React from 'react';
import Trip from './Trip';
import ErrorPage from '../../components/common/ErrorPage';
import fetch from '../../core/fetch';

export default {

  path: '/trip/:uuid?/:action?',

  async action({ params, context }) {
    
    const { graphqlRequest } = context.store.helpers;
    
    let userUuid = null; 
    const state = context.store.getState();
    const { auth } = state.auth;
    if (auth.loggedIn) {
      userUuid = auth.user.uuid;
    }
     
    try { 
    
      if (params.uuid) {
        
        const { data } = await graphqlRequest(
          `query {
            trip(uuid: "${params.uuid}") {
              uuid
            },
            transportTypes { slug }
          }`
        );
        
        log.info("event=received-trip", "data:", data);
        
        const edit = params.action === 'edit';
        const props = { 
          edit, 
          trip: data.trip
        };
        
        if (edit) {
          props.transportTypes = data.transportTypes;
        }
        
        return <Trip {...props} />;
    
      } else {
        
        const { data } = await graphqlRequest(
          `query {
            userLinks (uuid: "${userUuid}") {
              uuid,
              linkInstances { 
                uuid,
                departureDate,
                createdAt,
                link {
                  from { apiId, name, description, countryLong, lat, lng },
                  to { apiId, name, description, countryLong, lat, lng } 
                },
                transport { slug }
              }
            }
          }`
        );
        
        log.info("event=received-trip-user-links", data);
        
        return <Trip edit={true}
          trip={{}}
          userLinks={data.userLinks} />;
      
      }

    } catch (error) {
      log.error(error);
      return <ErrorPage errors={error.errors} />
    }
  
  }

};
