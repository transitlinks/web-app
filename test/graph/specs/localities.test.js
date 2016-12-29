import assert from 'assert';
import { test, assertResponse } from '../utils';

describe('data/queries/localities', () => {

  it('returns autocomplete predictions', async () => {
    
    const query = JSON.stringify({
      query: `query {
        localities(input: "moscow", types: "(cities)", location: "45.50,65.50", radius: 10000) {
          apiId,
          description,
          countryLong,
          lat,
          lng
        }
      }`,
      variables: {}
    });
    
    const response = await test(query);
    assertResponse(response);

    assert(response.data.localities.length > 0, '0 autocomplete results');
  
  });

});
