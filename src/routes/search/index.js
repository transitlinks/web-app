import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Search from './Search';
import fetch from '../../core/fetch';

export default {

  path: '/search',

  async action({ context }) {
    
      const { graphqlRequest } = context.store.helpers; 

      try {
        
        const { data } = await graphqlRequest(
          'query {links(localityId:1) {from {name,lat,lng}, to {name,lat,lng}}}'
        );
       
        return <Search links={data.links} />; 

      } catch (error) {
        return <ErrorPage errors={error.errors} />
      }
    
  },

};
