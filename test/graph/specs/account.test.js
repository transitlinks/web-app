import assert from 'assert';
import { 
  createTestUsers,
  createOrUpdateLinkInstance,
  validLinkInstance,  
  test, 
  assertResponse 
} from '../utils';

describe('data/queries/account', () => {
  
  let testUsers;

  before(async () => {

    testUsers = await createTestUsers(
      { email: 'test1@test.tt', photo: 'abc.jpg' },
      { email: 'test2@test.tt', photo: 'def.jpg' }
    );

    const departureDate = new Date();
    const arrivalDate = new Date(departureDate.getTime() + (3 * 60 * 60 * 1000));

    createOrUpdateLinkInstance(validLinkInstance(departureDate, arrivalDate), testUsers[0].uuid);

  });

  it('should get profile info for user', async () => {
    
    const query = JSON.stringify({
      query: `
        query { 
          profile (uuid: "${testUsers[0].uuid}") {
            uuid,
            email,
            photo
          }
        }
      `,
      variables: {}
    });

    let response = await test(query);
    assertResponse(response, 'access-denied');
    
    response = await test(query, testUsers[1].uuid);
    assertResponse(response, 'access-denied');

    response = await test(query, testUsers[0].uuid);
    assertResponse(response);

    const { profile } = response.data;
    assert.equal(profile.uuid, testUsers[0].uuid);
    assert.equal(profile.email, 'test1@test.tt');
    assert.equal(profile.photo, 'abc.jpg');
  
  });
  
  it('should get user links for user', async () => {
    
    const query = JSON.stringify({
      query: `
        query { 
          userLinks (uuid: "${testUsers[0].uuid}") {
            uuid,
            linkInstances { 
              uuid,
              departureDate,
              createdAt,
              link {
                from { apiId, name, description, countryLong, lat, lng },
                to { apiId, name, description, countryLong, lat, lng } 
              },
              transport { slug }
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

    response = await test(query, testUsers[0].uuid);
    assertResponse(response);

    const { userLinks } = response.data;
    assert.equal(userLinks.uuid, testUsers[0].uuid);
    assert(userLinks.linkInstances);
    assert.equal(userLinks.linkInstances.length, 1);
    assert(userLinks.linkInstances[0].link);
    assert(userLinks.linkInstances[0].departureDate);
    assert(userLinks.linkInstances[0].createdAt);
    assert(userLinks.linkInstances[0].transport);
  
  });
  
});
