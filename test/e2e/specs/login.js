import assert from 'assert';

describe('Test Login', () => {

	it('Local log-in works', () => {
		
		browser
      .url('http://localhost:3000/login');
    
    browser.waitForExist('#input-email');
    
    browser
      .setValue('#input-email', 'vhalme@gmail.com')
      .setValue('#input-password', 'test1')
      .click('form button');
    
    browser.waitForExist('#logout-link');

    
  });

});
