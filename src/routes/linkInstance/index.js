import log from '../../core/log';
import React from 'react';
import LinkInstance from './LinkInstance';
import ErrorPage from '../../components/common/ErrorPage';
import fetch from '../../core/fetch';

export default {

  path: '/link-instance/:id?',

  async action({ params, context }) {
    
    if (params.id) {
      
      const { graphqlRequest } = context.store.helpers;
      
      try { 
        
        const { data } = await graphqlRequest(
          `query {
            linkInstance(id: ${params.id}) 
            {id,link{from{id,name,lat,lng},to{id,name,lat,lng}},transport{slug}}
          }`
        );
        
        return <LinkInstance edit={false} linkInstance={data.linkInstance} />; 
      
      } catch (error) {
        return <ErrorPage errors={error.errors} />
      }

    
    } else {
      return <LinkInstance edit={true} linkInstance={{}} />;
    }

  }

};
