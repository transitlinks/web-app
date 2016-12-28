import assert from 'assert';
import { 
  createTestUsers, validLinkInstance, createOrUpdateLinkInstance, 
  test, assertResponse 
} from '../utils';

const date = new Date();
const twoDaysLater = new Date(date.getTime());
twoDaysLater.setDate(date.getDate() + 2);
const twoDaysInMinutes = (twoDaysLater.getTime() - date.getTime()) / 1000 / 60;

describe('data/queries/links', () => {

  let testUsers;

  before(async () => {
    testUsers = await createTestUsers(
      { email: 'test1@test.tt' },
      { email: 'test2@test.tt' },
      { email: 'test3@test.tt' }
    );
  });

  it('should create new link instance', async () => {
    await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater)); 
  });
  
  it('should update existing link instance', async () => {
    
    let response = await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater)); 
    assertResponse(response);
    
    let linkInstance = response.data.linkInstance;
    assert(linkInstance);
    
    linkInstance = { ...validLinkInstance(date, twoDaysLater), uuid: linkInstance.uuid, description: 'this is not description' };
    response = await createOrUpdateLinkInstance(linkInstance)
    assertResponse(response);
    linkInstance = response.data.linkInstance;
    assert(linkInstance);

    assert.equal(linkInstance.description, 'this is not description');  

  });
  
  it('returns links by locality name', async () => {
        
    await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater)); 
    
    const query = JSON.stringify({
      query: `
        query { 
          links (input: "Moscow") {
            uuid,
            from { description }, 
            to { description },
            instanceCount
          }
        }
      `,
      variables: {}
    });
    
    const response = await test(query);
    assertResponse(response);   

    const { links } = response.data;
    assert(links.length > 0, '0 links by id results');
    assert(links[0].from);
    assert(links[0].to);
    assert(links[0].instanceCount);
  
  });
  
  it('returns link by id', async () => {
    
    let response = await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater), testUsers[0].uuid); 
    assertResponse(response);
    
    let linkInstance = response.data.linkInstance;
    assert(linkInstance);
    
    const query = JSON.stringify({
      query: `
        query {
          link (uuid: "${linkInstance.link.uuid}") {
            from { name, lat, lng },
            to { name, lat, lng },
            instances {
              uuid,
              transport { slug },
              durationMinutes
            }
          }
        }
      `,
      variables: {}
    });
    
    response = await test(query); 
    assertResponse(response);

    const { link } = response.data;
    assert(link, 'missing property: link');
    assert(link.from, 'missing property: link.from');
    assert(link.to, 'missing property: link.to');

    const { instances } = link;
    assert(instances && instances.length > 0, 'missing or empty property: link.instances');
    assert.equal(instances[0].durationMinutes, (twoDaysInMinutes - 120));

  });
  
  it('returns link instance by id', async () => {
    
    let response = await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater)); 
    assertResponse(response);
    
    let linkInstance = response.data.linkInstance;
    assert(linkInstance);
    
    const query = JSON.stringify({
      query: `
        query {
          linkInstance(uuid:"${linkInstance.uuid}") {
            uuid,
            transport { slug }
            link {
              from { name, lat, lng },
              to { name, lat, lng }
            },
            departureDate, departureHour, departureMinute, departureDescription,
            arrivalDate, arrivalHour, arrivalMinute, arrivalDescription,
            priceAmount, priceCurrency,
            description,
            durationMinutes
          }
        }
      `,
      variables: {}
    });
    
    response = await test(query);
    assertResponse(response);
    
    assert(response.data.linkInstance);

    linkInstance = response.data.linkInstance;
    assert(linkInstance.transport, 'missing property: linkInstance.transport');
    assert(linkInstance.link, 'missing property: linkInstance.link');
    assert(linkInstance.link.from, 'missing property: linkInstance.link.from');
    assert(linkInstance.link.to, 'missing property: linkInstance.link.to');
    assert(linkInstance.departureDate, 'missing property: linkInstance.departureDate');
    assert(linkInstance.departureHour, 'missing property: linkInstance.departureHour');
    assert(linkInstance.departureMinute, 'missing property: linkInstance.departureMinute');
    assert(linkInstance.departureDescription, 'missing property: linkInstance.departureDescription');
    assert(linkInstance.arrivalDate, 'missing property: linkInstance.arrivalDate');
    assert(linkInstance.arrivalHour, 'missing property: linkInstance.arrivalHour');
    assert(linkInstance.arrivalMinute, 'missing property: linkInstance.arrivalMinute');
    assert(linkInstance.arrivalDescription, 'missing property: linkInstance.arrivalDescription');
    assert(linkInstance.priceAmount, 'missing property: linkInstance.priceAmount');
    assert(linkInstance.priceCurrency, 'missing property: linkInstance.priceCurrency');
    assert(linkInstance.description, 'missing property: linkInstance.description');
    assert.equal(linkInstance.durationMinutes, (twoDaysInMinutes - 120));

  });
  
  it('returns user links by user uuid', async () => {
        
    await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater), testUsers[2].uuid); 
    await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater), testUsers[2].uuid);
    
    const query = JSON.stringify({
      query: `
        query { 
          userLinks (uuid: "${testUsers[2].uuid}") {
            uuid,
            linkInstances {
              link {
                from { description }, 
                to { description }
              },
              transport {
                slug
              }
            }
          }
        }
      `,
      variables: {}
    });
    
    let response = await test(query);
    assertResponse(response, 'access-denied');
    
    response = await test(query, testUsers[1].uuid);
    assertResponse(response, 'access-denied');
    
    response = await test(query, testUsers[2].uuid);
    assertResponse(response);

    const { userLinks } = response.data;
    assert(userLinks, 'Invalid userLinks response');
    assert.equal(userLinks.uuid, testUsers[2].uuid);
    assert.equal(userLinks.linkInstances.length, 2);
  
  });

});
