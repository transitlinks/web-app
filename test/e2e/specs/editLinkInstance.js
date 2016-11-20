import assert from 'assert';

describe('Edit link instance', () => {

	it('Link instance is editable and saveable', () => {
	  
		browser
      .url('/link-instance');
   
    browser.waitForExist('#from-autocomplete-full');
    browser.waitForExist('#from-autocomplete-compact');
    browser.waitForExist('#to-autocomplete-compact');
    browser.waitForExist('#to-autocomplete-full');
    
    if (browser.isVisible('#from-autocomplete-full')) {
      browser.click('#from-autocomplete-full'); 
    } else {
      browser.click('#from-autocomplete-compact'); 
    }

    browser.keys('he'); 
    browser.pause(1000); 
    browser.keys('ls'); 
    browser.pause(1000); 
    browser.click('#helsinki');
    
    if (browser.isVisible('#to-autocomplete-full')) {
      browser.click('#to-autocomplete-full'); 
    } else {
      browser.click('#to-autocomplete-compact'); 
    }

    browser.keys('mo'); 
    browser.pause(1000); 
    browser.keys('sc'); 
    browser.pause(1000); 
    browser.click('#moscow');
    
    browser
      .click('#transport-select')
      .click('#train');

    browser.pause(1000);
    browser.click('#save-top');

    browser.waitForExist('#place-from');
    browser.waitForExist('#place-to');
    
    const placeFrom = browser.getText('#place-from');    
    const placeTo = browser.getText('#place-to');    
  
    assert(placeFrom === 'Helsinki, Finland');    
    assert(placeTo === 'Moscow, Russia');
 
  });

});
