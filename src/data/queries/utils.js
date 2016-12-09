import assert from 'assert';
import { tester } from 'graphql-tester';
import { User } from '../models';
import { GRAPHQL_URL } from '../../config';

export const requireOwnership = (request, uuid) => {

  if (!(request.user && request.user.uuid === uuid)) {
    throw new Error("access-denied");
  }

};

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
