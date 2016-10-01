import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Content from './Content';
import fetch from '../../core/fetch';

export default {

  path: '*',

  async action({ context, path }) { // eslint-disable-line react/prop-types
    
    const { graphqlRequest } = context.store.helpers; 
    try {
      
      const { data } = await graphqlRequest(
        `query {content(path:"${path}"){path,title,content,component}}`
      );
     
      return <Content {...data.content} />; 

    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }
  
  }

};
