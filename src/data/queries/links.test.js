import assert from 'assert';
import { tester } from 'graphql-tester';
 
const test = tester({
  url: 'http://localhost:3000/graphql',
  contentType: 'application/json'
});

const validLinkInstance = { 
  from: 'moscow', 
  to: 'helsinki',
  transport: 'bus'
};

const createLinkInstance = async (linkInstance) => {
  
  const query = JSON.stringify({
    query: `
      mutation ($linkInstance:LinkInstanceInput!) {
        linkInstance(linkInstance:$linkInstance) {
          link {
            id,
            from {name,lat,lng}, 
            to {name,lat,lng}
          },
          transport { slug }
        }
      }
    `,
    variables: { linkInstance }
  });
  
  const response = await test(query);
  assert(response.success == true);
  assert(response.status == 200); 
  assert(response.data.linkInstance);
  return response;

};

 
describe('data/queries/links', () => {

  it('should create new link instance', async () => {
    await createLinkInstance(validLinkInstance); 
  });
  
  it('returns links by locality name', async () => {
        
    await createLinkInstance(validLinkInstance); 
    
    const query = JSON.stringify({
      query: `
        query { 
          links(input:"moscow") {
            from { name, lat, lng }, 
            to { name, lat, lng }
          }
        }
      `,
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200);
    assert(response.data.links.length > 0, '0 links by id results');
  
  });
  
  it('returns link by id', async () => {
    
    await createLinkInstance(validLinkInstance);
    
    const query = JSON.stringify({
      query: `
        query {
          link(id:1) {
            from { name, lat, lng },
            to { name, lat, lng },
            instances {
              transport { slug }
            }
          }
        }
      `,
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200); 
    assert(response.data.link.from && response.data.link.to);
    assert(response.data.link.instances && response.data.link.instances.length > 0);

  });
  
  it('returns link instance by id', async () => {
    
    await createLinkInstance(validLinkInstance);
    
    const query = JSON.stringify({
      query: `
        query {
          linkInstance(id:1) {
            id,
            transport { slug }
            link {
              from { name, lat, lng },
              to { name, lat, lng }
            }
          }
        }
      `,
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200); 
    assert(response.data.linkInstance);

  });

});
