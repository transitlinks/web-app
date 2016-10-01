import fetch from '../core/fetch';

function createGraphqlRequest(fetchKnowingCookie) {
  
  return async function graphqlRequest(query, variables = {}) {
    
    const body = JSON.stringify({ query, variables });
    const fetchConfig = {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
      credentials: 'include',
    };
     
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
