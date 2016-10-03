import assert from 'assert';
import { tester } from 'graphql-tester';
import { GRAPHQL_URL } from '../../config';
 
const test = tester({
  url: GRAPHQL_URL,
  contentType: 'application/json'
});
 
describe('data/queries/localities', async () => {

  await it('returns autocomplete predictions', async () => {
    
    const query = JSON.stringify({
      query: 'query {localities(input:"moscow") {id,name,lat,lng}}',
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200);
    assert(response.data.localities.length > 0, '0 autocomplete results');
  
  });

});
