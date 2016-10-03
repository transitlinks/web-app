import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Search from './Search';
import fetch from '../../core/fetch';

export default {

  path: '/search',

  async action({ context }) {
    return <Search />; 
  }

};
