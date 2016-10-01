import assert from 'assert';
import { tester } from 'graphql-tester';
 
const test = tester({
  url: 'http://localhost:3000/graphql',
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
