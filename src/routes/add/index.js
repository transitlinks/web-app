import { getLog } from '../../core/log';
const log = getLog('routes/account');

import React from 'react';
import ErrorPage from '../../components/common/ErrorPage';
import Add from './Add';

export default {

  path: '/add/:type?',

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

      const type = params.type || 'place';

      if (type === 'place') {

        /*
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
        return <Add place={data.profile} />;
        */

        return <Add place={{}} />;

      } else if (type === 'link') {

        /*
        const { data } = await graphqlRequest(
          `query {
            userLinks (uuid: "${uuid}") {
              uuid,
              linkInstances {
                uuid,
                departureDate,
                createdAt,
                link {
                  from { apiId, name, description, countryLong, lat, lng },
                  to { apiId, name, description, countryLong, lat, lng }
                },
                transport { slug }
              }
            }
          }`
        );

        log.info("event=received-user-links-data", data);
        return <Add link={data.userLinks} />;
        */

        return <Add link={{}} />;

      }

      throw new Error('Unknown content type');

    } catch (error) {
      return <ErrorPage errors={error.errors} />
    }

  }

};
