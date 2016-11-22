import { getLog } from '../../core/log';
const log = getLog('routes/account');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Account from './Account';

export default {

  path: '/account/:section?/:uuid?',

  async action({ params, context }) {
    
    let uuid = params.uuid;
    if (!uuid) {
      const state = context.store.getState();
      const { auth } = state.auth;
      if (auth.loggedIn) {
        uuid = auth.user.uuid;
      }
    }
    
    const { graphqlRequest } = context.store.helpers;
 
    try { 
      
      const section = params.section || 'profile';
      
      if (section === 'profile') {
        
        const { data } = await graphqlRequest(
          `query {
            profile (uuid: "${uuid}") {
              uuid,
              email,
              photo
            }
          }`
        );
        
        log.info("event=received-profile-data", data);
        return <Account profile={data.profile} />;

      } else if (section === 'links') {
        
        const { data } = await graphqlRequest(
          `query {
            userLinks (uuid: "${uuid}") {
              uuid,
              links { from, to, transport }
            }
          }`
        );
        
        log.info("event=received-user-links-data", data);
        return <Account links={data.userLinks} />;
      
      }
   
      throw new Error('Unknown section');
    
    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }

  }

};
