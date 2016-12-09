import assert from 'assert';
import { createTestUsers, test, assertResponse } from './utils';

describe('data/queries/account', () => {
  
  let testUsers;

  before(async () => {
    testUsers = await createTestUsers(
      { email: 'test1@test.tt', photo: 'abc.jpg' },
      { email: 'test2@test.tt', photo: 'def.jpg' }
    );
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
  
});
