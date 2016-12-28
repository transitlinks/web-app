import assert from 'assert';
import { tester } from 'graphql-tester';
import { User } from '../../src/data/models';
import { GRAPHQL_URL } from '../../src/config';

export const assertResponse = (response, error) => {
  if (!error) {
    assert(response.success == true, `response failure: status: ${response.status}, raw: ${response.raw}`);
    assert.equal(response.status, 200);
  } else {
    const { errors } = response;
    assert(errors && errors.length > 0, 'No errors were present');
    assert.equal(errors[0].message, error);
  }
};

export const test = (query, userUuid) => {
  return tester({
    url: GRAPHQL_URL,
    contentType: 'application/json',
    authorization: userUuid ? `mock:${userUuid}` : null
  })(query);
};

export const createTestUsers = async (...users) => {
  
  const testUsers = [];
  for (let i = 0; i < users.length; i++) {
    const user = await User.create(users[i]);
    testUsers.push(user);
  }

  return testUsers;

};

export const validLinkInstance = (departureDate, arrivalDate) => {
  return { 
    from: 'moscow', 
    to: 'helsinki',
    transport: 'bus',
    departureDate: departureDate.toJSON(),
    departureHour: 15,
    departureMinute: 30,
    departureDescription: 'leningradsky vokzal',
    arrivalDate: arrivalDate.toJSON(),
    arrivalHour: 13,
    arrivalMinute: 30,
    arrivalDescription: 'central railway station',
    priceAmount: 120.50,
    priceCurrency: 'USD',
    description: 'this is description'
  };
};

export const createOrUpdateLinkInstance = async (linkInstance, userUuid) => {
  
  const query = JSON.stringify({
    query: `
      mutation ($linkInstance:LinkInstanceInput!) {
        linkInstance(linkInstance:$linkInstance) {
          uuid,
          link {
            uuid,
            from { name, description, countryLong, countryShort, lat, lng }, 
            to { name, description, countryLong, countryShort, lat, lng }
          },
          transport { slug },
          description
        }
      }
    `,
    variables: { linkInstance }
  });
  
  const response = await test(query, userUuid);
  assertResponse(response);
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
