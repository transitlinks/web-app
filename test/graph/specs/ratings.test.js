import assert from 'assert';
import { 
  createTestUsers, validLinkInstance, createOrUpdateLinkInstance, 
  test, assertResponse 
} from '../utils';

const date = new Date();
const twoDaysLater = new Date(date.getTime());
twoDaysLater.setDate(date.getDate() + 2);
const twoDaysInMinutes = (twoDaysLater.getTime() - date.getTime()) / 1000 / 60;

const saveRating = async (rating) => {
  
  const query = JSON.stringify({
    query: `
      mutation ($rating:RatingInput!) {
        rating(rating:$rating) {
          userUuid,
          linkInstanceUuid,
          avgRating,
          avgAvailabilityRating,
          avgDepartureRating,
          avgArrivalRating,
          avgAwesomeRating,
          userAvailabilityRating,
          userDepartureRating,
          userArrivalRating,
          userAwesomeRating
        }
      }
    `,
    variables: { rating }
  });
  
  const response = await test(query, rating.userUuid);
  assertResponse(response);
  assert(response.data.rating);
  
  return response.data.rating;

};

const getRatings = async (userUuid, linkInstanceUuid) => {
  
  const query = JSON.stringify({
    query: `
      query { 
        ratings (userUuid: "${userUuid}", linkInstanceUuid: "${linkInstanceUuid}") {
          userUuid,
          linkInstanceUuid,
          avgRating,
          avgAvailabilityRating,
          avgDepartureRating,
          avgArrivalRating,
          avgAwesomeRating,
          userAvailabilityRating,
          userDepartureRating,
          userArrivalRating,
          userAwesomeRating
        }
      }
    `,
    variables: {}
  });
  
  const response = await test(query, userUuid);
  assertResponse(response);
  assert(response.data.ratings);
  
  return response.data.ratings;

};

describe('data/queries/rating', () => {

  let testUsers;

  before(async () => {
    testUsers = await createTestUsers(
      { email: 'rating1@test.tt' },
      { email: 'rating2@test.tt' },
      { email: 'rating3@test.tt' }
    );
  });

  it('should save a rating', async () => {
    
    const response = 
      await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater), testUsers[0].uuid);

    const linkInstance = response.data.linkInstance;

    let ratings = await saveRating({
      userUuid: testUsers[0].uuid,
      linkInstanceUuid: linkInstance.uuid,
      property: 'availability',
      rating: 1
    });
    
    assert.equal(ratings.avgRating, 1);
    assert.equal(ratings.userAvailabilityRating, 1);
    
  });
   
  it('returns ratings for a link instance', async () => {
    
    const response = 
      await createOrUpdateLinkInstance(validLinkInstance(date, twoDaysLater), testUsers[0].uuid);

    const linkInstance = response.data.linkInstance;

    await saveRating({
      userUuid: testUsers[0].uuid,
      linkInstanceUuid: linkInstance.uuid,
      property: 'availability',
      rating: 2
    });
    
    await saveRating({
      userUuid: testUsers[0].uuid,
      linkInstanceUuid: linkInstance.uuid,
      property: 'awesome',
      rating: 5
    });
    
    await saveRating({
      userUuid: testUsers[1].uuid,
      linkInstanceUuid: linkInstance.uuid,
      property: 'awesome',
      rating: 3
    });
    
    const ratings = await getRatings(testUsers[0].uuid, linkInstance.uuid);  
    assert.equal(ratings.avgRating, 3);
    assert.equal(ratings.userAvailabilityRating, 2);
    assert.equal(ratings.userAwesomeRating, 5);
    assert.equal(ratings.avgAwesomeRating, 4);

  });

});

