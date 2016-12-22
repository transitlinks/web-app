import assert from 'assert';
import { editAndSaveLinkInstance } from '../utils';

describe('Edit link instance', () => {
	
  it('Can create and edit link instance', () => {
     
		browser.url('/login');
    browser.waitForExist('#login-email');
    
    browser
      .setValue('#login-email', 'edit@test.ing')
      .setValue('#login-password input', 'test1')
      .click('form button');
    
    browser.waitForExist('#logout-link');
    
    browser.url('/link-instance');
    browser.pause(1000);       
    editAndSaveLinkInstance('train', '120.5', 'RUB', 'general desc', []);
    
    const url = browser.getUrl();
    const urlParts = url.split('/');
    const uuid = urlParts[urlParts.length - 1];
 
    browser.url(`/link-instance/${uuid}/edit`);
    browser.pause(1000);       
    editAndSaveLinkInstance('bus', '110', 'EUR', 'other desc');
  
  });

});
