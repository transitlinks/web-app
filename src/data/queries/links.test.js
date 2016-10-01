import assert from 'assert';
import { tester } from 'graphql-tester';
 
const test = tester({
  url: 'http://localhost:3000/graphql',
  contentType: 'application/json'
});
 
describe('data/queries/links', () => {

  it('should create new link', async () => {
    
    const query = JSON.stringify({
      query: 'mutation ($link:TransitLinkInput!) {link(link:$link) {from {name,lat,lng}, to {name,lat,lng}}}',
      variables: { link: { from: 'ChIJybDUc_xKtUYRTM9XV8zWRD0', to: 'ChIJA280k5i_3ocRe-IAInh_ilY' } }
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200); 
    assert(response.data.link.from && response.data.link.to);

  });

  it('returns links by locality id', async () => {
    
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
