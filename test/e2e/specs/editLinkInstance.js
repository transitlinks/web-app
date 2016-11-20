import assert from 'assert';

const testTerminal = (terminal) => {
    
    browser.click(`#${terminal}-date-picker`);
    browser.pause(500);
    browser.click('button svg');
    browser.pause(500); 
    browser.click('button=' + (terminal === 'departure' ? '10' : '11')); 
    browser.click('button=OK'); 
    browser.pause(500);
    browser.click(`#${terminal}-time-picker`);
    browser.pause(500);
    browser.click('button=OK'); 
    const time = browser.getValue(`#${terminal}-time-picker`);
    assert(time.indexOf(':') === 2, `Invalid ${terminal} time value selected`);
    browser.setValue(`#${terminal}-terminal-place-input`, `${terminal} desc`);

};
 
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
    browser.pause(500); 
    browser.keys('ls'); 
    browser.waitForExist('#helsinki');
    browser.click('#helsinki');
    
    if (browser.isVisible('#to-autocomplete-full')) {
      browser.click('#to-autocomplete-full'); 
    } else {
      browser.click('#to-autocomplete-compact'); 
    }

    browser.keys('mo'); 
    browser.pause(500); 
    browser.keys('sc'); 
    browser.waitForExist('#moscow');
    browser.click('#moscow');
    
    browser
      .click('#transport-select')
      .click('#train');
    
    browser.pause(500); 
    testTerminal('departure');
    testTerminal('arrival');
    
    browser.setValue('#price-amount-input', '120.50');    
    browser.click('#currency-select');
    browser.pause(500);
    browser.click('span*=RUB');
    browser.pause(500);
    browser.click('#description-input');
    browser.pause(500);
    browser.keys('general desc');
    browser.pause(500);    
    
    browser.moveToObject('#availability-rating span:nth-child(2)', 2, 2);
    browser.click('#availability-rating span:nth-child(2)');
    browser.moveToObject('#dept-reliability-rating span:nth-child(2)', 2, 2);
    browser.click('#dept-reliability-rating span:nth-child(2)');
    browser.moveToObject('#arr-reliability-rating span:nth-child(4)', 2, 2);
    browser.click('#arr-reliability-rating span:nth-child(4)');
    browser.moveToObject('#awesomeness-rating span:nth-child(4)', 2, 2);
    browser.click('#awesomeness-rating span:nth-child(4)');
    
    const deptDate = browser.getValue('#departure-date-picker');
    const deptTime = browser.getValue('#departure-time-picker');
    const arrDate = browser.getValue('#arrival-date-picker');
    const arrTime = browser.getValue('#arrival-time-picker');
    
    browser.click('#save-top');
    
    browser.waitForVisible('#place-from');
    
    assert.equal(browser.getText('#place-from'), 'Helsinki, Finland');
    assert.equal(browser.getText('#place-to'), 'Moscow, Russia');
    assert.equal(browser.getText('#dept-date-value'), deptDate);
    assert.equal(browser.getText('#dept-time-value'), deptTime);
    assert.equal(browser.getText('#arr-date-value'), arrDate);
    assert.equal(browser.getText('#arr-time-value'), arrTime);
    assert.equal(browser.getText('#price-value'), '120.5 RUB');
    assert.equal(browser.getText('#desc-value'), 'general desc');
    assert.equal(browser.getText('#avg-rating-value'), '2.5');
 
  });

});
