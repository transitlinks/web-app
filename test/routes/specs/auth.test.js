import assert from 'assert';
import fetch from 'node-fetch';
import { APP_URL } from '../../../src/config';

const assertResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  assert(response.status, 200);
  assert(contentType === 'text/html', `Incorrect content type: ${contentType}`);
};

describe('routes/auth', () => {

  it('should respond to local login call', async () => {
    const response = await fetch(`${APP_URL}/login`, { method: 'POST' });
    console.log("local response", response);
    assertResponse(response);
  });

  it('should respond to fb login call', async () => {
    const response = await fetch(`${APP_URL}/login/fb`);
    console.log("fb login response", response);
    assertResponse(response);
  });

  it('should respond to fb callback', async () => {
    const response = await fetch(`${APP_URL}/login/fb/callback`);
    console.log("fb callback response", response);
    assertResponse(response);
  });
  
  it('should respond to google login call', async () => {
    const response = await fetch(`${APP_URL}/login/google`);
    console.log("google login response", response);
    assertResponse(response);
  });
  
  it('should respond to google callback', async () => {
    const response = await fetch(`${APP_URL}/login/google/callback`);
    console.log("google callback response", response);
    assertResponse(response);
  });
  
});
