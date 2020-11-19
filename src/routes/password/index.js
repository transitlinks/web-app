import { getLog } from '../../core/log';
const log = getLog('routes/password');

import React from 'react';
import ResetPassword from './ResetPassword';
import ErrorPage from '../../components/common/ErrorPage';

export default {

  path: '/reset-password/:code?',

  async action({ params, context }) {

    const { graphqlRequest } = context.store.helpers;

    try {
      const { data } = await graphqlRequest(
        `query {
            resetPassword (code: "${params.code}")
         }`
      );

      log.info("event=received-reset-password-data", data);
      return <ResetPassword email={data.resetPassword} code={params.code} />;

    } catch (error) {
      log.info("error=route-reset-password", error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
