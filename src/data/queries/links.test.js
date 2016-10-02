import assert from 'assert';
import { tester } from 'graphql-tester';
 
const test = tester({
  url: 'http://localhost:3000/graphql',
  contentType: 'application/json'
});

const createLinkMutation = JSON.stringify({
  query: 'mutation ($link:TransitLinkInput!) {link(link:$link) {from {name,lat,lng}, to {name,lat,lng}}}',
  variables: { link: { from: 'moscow', to: 'helsinki' } }
});
 
describe('data/queries/links', () => {

  it('should create new link', async () => {
        
    const response = await test(createLinkMutation);
    
    assert(response.success == true);
    assert(response.status == 200); 
    assert(response.data.link.from && response.data.link.to);

  });

  it('returns links by locality id', async () => {
        
    await test(createLinkMutation);
    
    const query = JSON.stringify({
      query: 'query {links(localityId:1) {from {name,lat,lng}, to {name,lat,lng}}}',
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200);
    assert(response.data.links.length > 0, '0 links by id results');
  
  });
  
  it('returns link by id', async () => {
    
    await test(createLinkMutation);
    
    const query = JSON.stringify({
      query: 'query {link(id:1) {from {name,lat,lng}, to {name,lat,lng}}}',
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200); 
    assert(response.data.link.from && response.data.link.to);

  });

});
