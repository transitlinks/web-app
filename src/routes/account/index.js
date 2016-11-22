import { getLog } from '../../core/log';
const log = getLog('routes/account');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Account from './Account';

export default {

  path: '/account/:section?/:id?',

  async action({ params, context }) {
    
    let id = params.id;
    if (!id) {
      const state = context.store.getState();
      const { auth } = state.auth;
      if (auth.loggedIn) {
        id = auth.user.id;
      }
    }
    
    const { graphqlRequest } = context.store.helpers;
 
    try { 
      
      const section = params.section || 'profile';
      
      if (section === 'profile') {
        
        const { data } = await graphqlRequest(
          `query {
            profile (id: ${id}) {
              id,
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
            userLinks (id: ${id}) {
              id,
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
