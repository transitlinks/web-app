import assert from 'assert';

describe('Test Transitlink frontpage', () => {

	it('title is displayed correctly', () => {
		
		browser
      .url('http://local.transitlinks.net:3000/')
      .pause(5000);
    
    assert(browser.getTitle().match(/Transitlinks/i));

  });

});
