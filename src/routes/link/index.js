import log from '../../core/log';
import React from 'react';
import TransitLink from './TransitLink';
import ErrorPage from '../../components/common/ErrorPage';
import { resetLink } from '../../actions/editLink';
import fetch from '../../core/fetch';

export default {

  path: '/link/:id',

  async action({ params, context }) {
      
    const { graphqlRequest } = context.store.helpers;
      
    try { 
      
      const { data } = await graphqlRequest(
        `query {
          link(id: ${params.id}) {
            id,
            from {id,name,lat,lng},
            to {id,name,lat,lng},
            instances {
              id,
              transport { id, slug }
            }
          }
        }`
      );
      
      console.log("DATA", data); 
      return <TransitLink link={data.link} />; 
    
    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }

  }

};
