import assert from 'assert';
import { tester } from 'graphql-tester';
import { GRAPHQL_URL } from '../../config';
 
const test = tester({
  url: GRAPHQL_URL,
  contentType: 'application/json'
});

const validLinkInstance = { 
  from: 'moscow', 
  to: 'helsinki',
  transport: 'bus',
  departureDate: (new Date()).toJSON(),
  departureHour: 12,
  departureMinute: 30,
  arrivalDate: (new Date()).toJSON(),
  arrivalHour: 15,
  arrivalMinute: 45,
  priceAmount: 120.50,
  priceCurrency: 'USD',
  description: 'this is description'
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
          links(input:"Moscow") {
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
            },
            departureDate, departureHour, departureMinute,
            arrivalDate, arrivalHour, arrivalMinute,
            priceAmount, priceCurrency,
            description
          }
        }
      `,
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200); 
    assert(response.data.linkInstance);

    const { linkInstance } = response.data;
    assert(linkInstance.transport);
    assert(linkInstance.link);
    assert(linkInstance.link.from);
    assert(linkInstance.link.to);
    assert(linkInstance.departureDate);
    assert(linkInstance.departureHour);
    assert(linkInstance.departureMinute);
    assert(linkInstance.arrivalDate);
    assert(linkInstance.arrivalHour);
    assert(linkInstance.arrivalMinute);
    assert(linkInstance.priceAmount);
    assert(linkInstance.priceCurrency);
    assert(linkInstance.description);

  });

});
