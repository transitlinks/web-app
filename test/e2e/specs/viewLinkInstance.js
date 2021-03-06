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
    
    browser.click('#add-media');
    browser.pause(500);
    browser.chooseFile('#upload-input', __dirname + '/data/deepdream.jpg');
    //browser.pause(500);
    //browser.submitForm('#upload-form');
    browser.pause(1000);
    
    const images = browser.elements(".mediaThumb");
    assert.equal(images.value.length, 1);
    
    browser.click('#new-comment-input');
    browser.setValue('#new-comment-input', ''); 
    browser.pause(500);
    browser.keys('abc def');
    browser.click('#submit-new-comment');
    browser.pause(500);
    browser.click('#new-comment-input');
    browser.setValue('#new-comment-input', ''); 
    browser.pause(500);
    browser.keys('def abc');
    browser.click('#submit-new-comment');
    browser.pause(500);
    
    const comments = browser.elements(".comment");
    assert.equal(comments.value.length, 2);
 
  });

});
