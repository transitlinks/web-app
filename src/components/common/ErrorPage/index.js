import { getLog } from '../../../core/log';
const log = getLog('components/ErrorPage');

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ErrorPage.css';

const ErrorPage = ({ errors }) => {
  
  log.debug('Error page shown', errors);

  return (
    <div className={s.container}>
      <div>
        Error
      </div>
      <div>
        {
          (errors || []).map((error, index) => (
            <div key={index}>{error.message}</div>
          ))
        }
      </div>
    </div>
  );

}

export default withStyles(s)(ErrorPage);
