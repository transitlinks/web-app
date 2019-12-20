import { getLog } from '../core/log';

export const graphqlAction = async (
  dispatch, getState, { graphqlRequest },
  { query, variables, files }, responseKeys,
  START_CODE, SUCCESS_CODE, ERROR_CODE
) => {

  const logger = getLog('actions/utils');

  dispatch({
    type: START_CODE,
    payload: {
      query,
      variables
    },
  });

  try {

    const response = await graphqlRequest(query, variables, files);
    logger.debug('GQL response', response);

    if (!response.data) {
      throw Object.assign(
        new Error('Invalid response'),
        { response }
      );
    }

    const payload = {
      query,
      variables
    };

    responseKeys.forEach(key => {
      payload[key] = response.data[key];
    });

    dispatch({
      type: SUCCESS_CODE,
      payload
    });

  } catch (error) {
    console.error('dispatching gql error', error);
    dispatch({
      type: ERROR_CODE,
      payload: {
        query,
        variables,
        error
      }
    });

    return false;

  }

  return true;

};
