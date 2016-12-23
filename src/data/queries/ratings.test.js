import assert from 'assert';
import { createTestUsers, test, assertResponse } from './utils';

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
  
  const response = await test(query, userUuid);
  assertResponse(response);
  assert(response.data.rating);
   
  return response.data.rating;

};

describe('data/queries/rating', () => {

  let testUsers;

  before(async () => {
    testUsers = await createTestUsers(
      { email: 'test1@test.tt' },
      { email: 'test2@test.tt' },
      { email: 'test3@test.tt' }
    );
  });

  it('should save a rating', async () => {
    
    //await createOrUpdateLinkInstance(validLinkInstance); 
  
  });
   
  it('returns ratings for a link instance', async () => {

    /*    
    await createOrUpdateLinkInstance(validLinkInstance); 
    
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
    */

  });

});

