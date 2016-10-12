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
  departurePlace: 'leningradsky vokzal',
  arrivalDate: (new Date()).toJSON(),
  arrivalHour: 15,
  arrivalMinute: 45,
  arrivalPlace: 'central railway station',
  priceAmount: 120.50,
  priceCurrency: 'USD',
  description: 'this is description',
  availabilityRating: 5,
  awesomeRating: 3
};

const createLinkInstance = async (linkInstance) => {
  
  const query = JSON.stringify({
    query: `
      mutation ($linkInstance:LinkInstanceInput!) {
        linkInstance(linkInstance:$linkInstance) {
          link {
            id,
            from { name, description, countryLong, countryShort, lat, lng }, 
            to { name, description, countryLong, countryShort, lat, lng }
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
  
  const { link } = response.data.linkInstance;
  assert(link);
  assert(link.from);
  assert(link.to);
  assert(link.from.name);
  assert(link.from.description);
  assert(link.from.countryLong);
  assert(link.from.countryShort);
  assert(link.from.lat);
  assert(link.from.lng);
  
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
            from { description }, 
            to { description },
            instanceCount
          }
        }
      `,
      variables: {}
    });
    
    const response = await test(query);
    
    assert(response.success == true);
    assert(response.status == 200);

    const { links } = response.data;
    assert(links.length > 0, '0 links by id results');
    assert(links[0].from);
    assert(links[0].to);
    assert(links[0].instanceCount);
  
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
              transport { slug },
              avgRating
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

    const { instances } = response.data.link;
    assert(instances && instances.length > 0);
    assert(instances[0].avgRating === 4);

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
            departureDate, departureHour, departureMinute, departurePlace,
            arrivalDate, arrivalHour, arrivalMinute, arrivalPlace,
            priceAmount, priceCurrency,
            description,
            avgRating
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
    assert(linkInstance.departurePlace);
    assert(linkInstance.arrivalDate);
    assert(linkInstance.arrivalHour);
    assert(linkInstance.arrivalMinute);
    assert(linkInstance.arrivalPlace);
    assert(linkInstance.priceAmount);
    assert(linkInstance.priceCurrency);
    assert(linkInstance.description);
    assert(linkInstance.avgRating === 4);

  });

});
