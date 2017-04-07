import assert from 'assert';
import { editAndSaveLinkInstance } from '../utils';

describe('View link instance', () => {
	
  it('Can view and rate link instance', () => {
     
		browser.url('/login');
    browser.waitForExist('#login-email');
    
    browser
      .setValue('#login-email', 'edit@test.ing')
      .setValue('#login-password input', 'test1')
      .click('form button');
    
    browser.waitForExist('#logout-link');
    
    browser.url('/link-instance');
    browser.pause(1000);       
    editAndSaveLinkInstance('train', 'experience', '123', '120.5', 'RUB', 'general desc', []);
    
    const url = browser.getUrl();
    const urlParts = url.split('/');
    const uuid = urlParts[urlParts.length - 1];
 
    browser.url(`/link-instance/${uuid}`);
    browser.pause(1000);       
    
    browser.moveToObject('#availability-rating span:nth-child(3)', 2, 2);
    browser.click('#availability-rating span:nth-child(3)');
    browser.moveToObject('#dept-reliability-rating span:nth-child(3)', 2, 2);
    browser.click('#dept-reliability-rating span:nth-child(3)');
    browser.moveToObject('#arr-reliability-rating span:nth-child(3)', 2, 2);
    browser.click('#arr-reliability-rating span:nth-child(3)');
    browser.moveToObject('#awesomeness-rating span:nth-child(3)', 2, 2);
    browser.click('#awesomeness-rating span:nth-child(3)');

    browser.pause(1000);
    assert.equal(browser.getText('#top-score-value'), '3');

    browser.click('#top-upvotes-button');
    browser.pause(200);
    browser.click('#top-upvotes-button');
    browser.pause(200);
    browser.click('#top-upvotes-button');
    browser.pause(200);
    browser.click('#top-downvotes-button');
    browser.pause(200);
    browser.click('#top-downvotes-button');
    browser.pause(200);

    assert.equal(browser.getText('#top-upvotes-value'), '3');
    assert.equal(browser.getText('#top-downvotes-value'), '2');

  });

});
