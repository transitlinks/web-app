import assert from 'assert';

describe('Test Login', () => {

	it('Local log-in works', () => {
		
		browser
      .url('http://localhost:3000/login');
    
    browser.waitForExist('#login-email');
    
    browser
      .setValue('#login-email', 'vhalme@gmail.com')
      .setValue('#login-password input', 'test1')
      .click('form button');
    
    browser.waitForExist('#logout-link');

    
  });

});
