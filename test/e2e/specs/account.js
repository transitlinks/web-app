import assert from 'assert';
import { editAndSaveLinkInstance } from '../utils';

describe('Test Account', () => {

	it('Can change profile info and password', () => {
		
		browser
      .url('http://localhost:3000/login');
    
    browser.waitForExist('#login-email');
    
    browser
      .setValue('#login-email', 'mrtest@test.ing')
      .setValue('#login-password input', 'test1')
      .click('form button');
    
    browser.waitForExist('#logout-link');

    browser.click('#logout-link a[href="/account"]');
    browser.waitForExist('input[name="profile-email"]');
    
    browser
      .setValue('input[name="profile-email"]', 'mr.test@test.inc')
      .click('#profile-fields button');

    browser.pause(500);
    
    browser
      .setValue('#password-reset input', 'test2')
      .click('#password-reset button');

    browser.pause(500);
    
    browser.click('#logout-link');
    browser.waitForExist('a[href="/login"]');
    browser.click('a[href="/login"]');
    browser.waitForExist('#login-email');
    
    browser
      .setValue('#login-email', 'mr.test@test.inc')
      .setValue('#login-password input', 'test2')
      .click('form button');
    
    browser.waitForExist('#logout-link');
    
  });

	it('Can view user links', () => {
		
		browser
      .url('http://localhost:3000/login');
    
    browser.waitForExist('#login-email');
    
    browser
      .setValue('#login-email', 'mrtest@test.ing')
      .setValue('#login-password input', 'test1')
      .click('form button');
    
    browser.waitForExist('#logout-link');

    browser.url('/link-instance');
    browser.pause(1000);
    editAndSaveLinkInstance('train', 'experience', '123', '120.5', 'RUB', 'general desc', []);
    browser.url('/link-instance');
    browser.pause(1000);
    editAndSaveLinkInstance('bus', 'experience', '123', '120.5', 'RUB', 'general desc', []);
    
    browser.click('#logout-link a[href="/account"]');
    browser.waitForExist('a[href="/account/links"]');
    browser.click('a[href="/account/links"]');
    browser.waitForExist('div.user-link');
    
    const links = browser.elements('div.user-link');
    assert.equal(links.value.length, 2);

    browser.click('div.user-link div.locality');
    browser.waitForVisible('#mode-value');


  });

});
