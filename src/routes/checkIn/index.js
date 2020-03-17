import { getLog } from '../../core/log';
const log = getLog('routes/linkInstance');

import React from 'react';
import CheckIn from './CheckIn';
import ErrorPage from '../../components/common/ErrorPage';
import { createQuery, getFeedItemQuery } from '../../data/queries/queries';

export default {

  path: '/check-in/:uuid',

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

        const query = createQuery([
          getFeedItemQuery(params.uuid),
          'transportTypes { slug }'
        ]);

        const { data } = await graphqlRequest(query);

        log.info("event=received-check-in", "data:", data);

        const edit = params.action === 'edit';
        const props = {
          edit,
          checkInItem: data.feedItem
        };

        if (edit) {
          props.transportTypes = data.transportTypes;
        }

        return <CheckIn {...props} />;

      } else {

        const { data } = await graphqlRequest(createQuery(['transportTypes { slug }']));

        return <CheckIn edit={true}
          checkIn={{}}
          transportTypes={data.transportTypes} />;

      }


    } catch (error) {
      log.error(error);
      return <ErrorPage errors={error.errors} />
    }

  }

};
