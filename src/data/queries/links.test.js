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
    console.log(response); 
    
    assert(response.success == true, `response failure: status: ${response.status}`);
    assert.equal(response.status, 200);

    const { link } = response.data;
    assert(link, 'missing property: link');
    assert(link.from, 'missing property: link.from');
    assert(link.to, 'missing property: link.to');

    const { instances } = link;
    assert(instances && instances.length > 0, 'missing or empty property: link.instances');
    assert.equal(instances[0].avgRating, 4);

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
    console.log(response); 
    
    assert(response.success == true, `response failure: status ${response.status}`);
    assert(response.status == 200); 
    assert(response.data.linkInstance);

    const { linkInstance } = response.data;
    assert(linkInstance.transport, 'missing property: linkInstance.transport');
    assert(linkInstance.link, 'missing property: linkInstance.link');
    assert(linkInstance.link.from, 'missing property: linkInstance.link.from');
    assert(linkInstance.link.to, 'missing property: linkInstance.link.to');
    assert(linkInstance.departureDate, 'missing property: linkInstance.departureDate');
    assert(linkInstance.departureHour, 'missing property: linkInstance.departureHour');
    assert(linkInstance.departureMinute, 'missing property: linkInstance.departureMinute');
    assert(linkInstance.departurePlace, 'missing property: linkInstance.departurePlace');
    assert(linkInstance.arrivalDate, 'missing property: linkInstance.arrivalDate');
    assert(linkInstance.arrivalHour, 'missing property: linkInstance.arrivalHour');
    assert(linkInstance.arrivalMinute, 'missing property: linkInstance.arrivalMinute');
    assert(linkInstance.arrivalPlace, 'missing property: linkInstance.arrivalPlace');
    assert(linkInstance.priceAmount, 'missing property: linkInstance.priceAmount');
    assert(linkInstance.priceCurrency, 'missing property: linkInstance.priceCurrency');
    assert(linkInstance.description, 'missing property: linkInstance.description');
    assert.equal(linkInstance.avgRating, 4);

  });

});
