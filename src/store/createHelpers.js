import fetch from '../core/fetch';

function createGraphqlRequest(fetchKnowingCookie) {

  return async function graphqlRequest(query, variables = {}, files) {

    const fetchConfig = {
      method: 'post',
      credentials: 'include'
    };

    if (files) {
      const form = new FormData();
      form.append('query', query);
      form.append('file', files[0]);
      fetchConfig.body = form;
    } else {
      const body = JSON.stringify({ query, variables });
      fetchConfig.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      fetchConfig.body = body;
    }

    let response = {};
    try {
      response = await fetchKnowingCookie('/graphql', fetchConfig);
    } catch (error) {
      response.errors = [ error ];
    }

    if (response.errors) {
      throw Object.assign(
        new Error('Errors in GQL response'),
        { errors: response.errors }
      );
    }

    return response;

  };
}

function createFetchKnowingCookie({ cookie }) {

  if (!process.env.BROWSER) {

    return async (url, options = {}) => {
      const isLocalUrl = /^\/($|[^\/])/.test(url);

      // pass cookie only for itself.
      // We can't know cookies for other sites BTW
      if (isLocalUrl && options.credentials === 'include') {
        const headers = {
          ...options.headers,
          cookie,
        };
        return fetch(url, { ...options, headers });
      }

      return fetch(url, options);
    };

  }

  return fetch;

}

export default function createHelpers(config) {

  const fetchKnowingCookie = createFetchKnowingCookie(config);
  const graphqlRequest = createGraphqlRequest(fetchKnowingCookie);

  return {
    fetch: fetchKnowingCookie,
    graphqlRequest,
    history: config.history,
  };

}
