import assert from 'assert';
import { 
  createTestUsers, validLinkInstance, createOrUpdateLinkInstance, 
  test, assertResponse 
} from '../utils';

export const createComment = async (comment) => {
  
  const query = JSON.stringify({
    query: `
      mutation saveComment($comment:CommentInput!) {
        comment(comment:$comment) {
          uuid,
          text,
          linkInstanceUuid
        }
      }
    `,
    variables: { comment }
  });
  
  return test(query);

};

describe('data/queries/comments', () => {

  let testUsers;

  before(async () => {
    /*
    testUsers = await createTestUsers(
      { email: 'test1@test.tt' },
      { email: 'test2@test.tt' },
      { email: 'test3@test.tt' }
    );
    */
  });

  it('should create a new comment', async () => {
    
    const date = new Date(); 
    let response = await createOrUpdateLinkInstance(validLinkInstance(date, new Date(date.getTime() + (1000 * 60 * 60 * 24)))); 
    assertResponse(response);
    
    let linkInstance = response.data.linkInstance;
    assert(linkInstance);
    
    response = await createComment({ text: 'abc', linkInstanceUuid: linkInstance.uuid });

    assertResponse(response);
    const comment = response.data.comment;
    
    assert.equal(comment.linkInstanceUuid, linkInstance.uuid);  
    assert.equal(comment.text, 'abc');  
    assert(comment.uuid);  

  });
  
  it('should get comments by link istance uuid', async () => {
    
    const date = new Date(); 
    let response = await createOrUpdateLinkInstance(validLinkInstance(date, new Date(date.getTime() + (1000 * 60 * 60 * 24)))); 
    assertResponse(response);
    
    let linkInstance = response.data.linkInstance;
    assert(linkInstance);
    
    await createComment({ text: 'abc', linkInstanceUuid: linkInstance.uuid });
    await createComment({ text: 'def', linkInstanceUuid: linkInstance.uuid });

    const query = JSON.stringify({
      query: `
        query getComments {
          comments(linkInstanceUuid: "${linkInstance.uuid}") {
            uuid,
            replyToUuid,
            text,
            up, down,
            user {
              uuid,
              username,
              firstName,
              lastName
            }
          }
        }
      `,
      variables: {}
    });
    
    response = await test(query);
    assertResponse(response);
    
    const comments = response.data.comments;
    assert.equal(comments.length, 2);  
    assert.equal(comments[0].text, 'abc');  
    assert.equal(comments[1].text, 'def');  

  });

});
  
