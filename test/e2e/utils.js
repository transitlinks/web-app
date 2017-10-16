import assert from 'assert';

const testTerminal = (terminal, location) => {
    
    browser.click(`#${terminal}-date-picker`);
    browser.pause(500);
    browser.click('button=' + (terminal === 'departure' ? '10' : '11')); 
    browser.pause(1000);
    browser.moveToObject(`#${terminal}-time-picker`, 10, 10);
    browser.click(`#${terminal}-time-picker`);
    browser.pause(1000);
    browser.click('button=OK');
    browser.pause(1000);
    const time = browser.getValue(`#${terminal}-time-picker`);
    console.log("TIME PICKER VAL", time);
    assert(time.indexOf(':') === 2, `Invalid ${terminal} time value selected`);
    
    browser.pause(2000);
    if (browser.isVisible(`#${terminal}-address-full`)) {
      browser.moveToObject(`#${terminal}-address-full`, 10, 10);
      browser.click(`#${terminal}-address-full`); 
    } else {
      browser.moveToObject(`#${terminal}-address-compact`, 10, 10);
      browser.click(`#${terminal}-address-compact`); 
    }

    browser.keys('ma'); 
    browser.pause(500); 
    browser.keys('nn'); 
    browser.pause(500); 
    browser.waitForExist(`#address-${location}`);
    browser.moveToObject(`#address-${location}`, 2, 2);
    browser.click(`#address-${location}`);

    browser.setValue(`#${terminal}-terminal-place-input`, `${terminal} desc`);

};

export const editAndSaveLinkInstanceMinimal = (transport, mode, identifier) => {
  
    browser.moveToObject('#mode-select', 40, 40);
    browser.click('#mode-select button');
    browser.pause(500);
    browser.click(`#mode-${mode}`);
    browser.pause(500);
     
    browser.waitForExist('#from-autocomplete-full');
    browser.waitForExist('#from-autocomplete-compact');
    browser.waitForExist('#to-autocomplete-compact');
    browser.waitForExist('#to-autocomplete-full');
    browser.waitForExist('#identifier-input');
    
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
      browser.setValue('#to-autocomplete-full', ''); 
    } else {
      browser.click('#to-autocomplete-compact'); 
      browser.setValue('#to-autocomplete-compact', ''); 
    }

    browser.keys('mo'); 
    browser.pause(500); 
    browser.keys('sc'); 
    browser.waitForExist('#moscow');
    browser.click('#moscow');
    
    browser
      .click('#transport-select')
      .click(`#${transport}`);
    
    browser.pause(500); 
    browser.click(`#identifier-input`);
    browser.setValue('#identifier-input', '');
    browser.keys(identifier);
    
    browser.pause(500);

};
  
export const editAndSaveLinkInstance = (transport, mode, identifier, priceAmount, priceCurrency, description, ratings) => {
    
    editAndSaveLinkInstanceMinimal(transport, mode, identifier);

    if (browser.isVisible('#from-autocomplete-full')) {
      browser.click('#from-autocomplete-full'); 
    } else {
      browser.click('#from-autocomplete-compact'); 
    }

    browser.keys('he'); 
    browser.pause(500); 
    browser.keys('ls'); 
    browser.pause(500); 
    browser.waitForExist('#helsinki');
    browser.click('#helsinki');
    
    if (browser.isVisible('#to-autocomplete-full')) {
      browser.click('#to-autocomplete-full'); 
      browser.setValue('#to-autocomplete-full', ''); 
    } else {
      browser.click('#to-autocomplete-compact'); 
      browser.setValue('#to-autocomplete-compact', ''); 
    }

    browser.keys('mo'); 
    browser.pause(500); 
    browser.keys('sc'); 
    browser.pause(500); 
    browser.waitForExist('#moscow');
    browser.click('#moscow');
    
    browser
      .click('#transport-select')
      .click(`#${transport}`);
    
    browser.pause(500); 
    
    testTerminal('departure', 'helsinki');
    testTerminal('arrival', 'moscow');
    
    browser.setValue('#price-amount-input', priceAmount);    
    browser.click('#currency-select');
    browser.pause(500);
    browser.click(`span*=${priceCurrency}`);
    browser.pause(500);
    browser.click('#description-input');
    browser.setValue('#description-input', ''); 
    browser.pause(500);
    browser.keys(description);
    browser.pause(500);    
    
    if (ratings) { 
      browser.moveToObject('#availability-rating span:nth-child(2)', 2, 2);
      browser.click('#availability-rating span:nth-child(2)');
      browser.moveToObject('#dept-reliability-rating span:nth-child(2)', 2, 2);
      browser.click('#dept-reliability-rating span:nth-child(2)');
      browser.moveToObject('#arr-reliability-rating span:nth-child(4)', 2, 2);
      browser.click('#arr-reliability-rating span:nth-child(4)');
      browser.moveToObject('#awesomeness-rating span:nth-child(4)', 2, 2);
      browser.click('#awesomeness-rating span:nth-child(4)');
    }

    const deptDate = browser.getValue('#departure-date-picker');
    const deptTime = browser.getValue('#departure-time-picker');
    const arrDate = browser.getValue('#arrival-date-picker');
    const arrTime = browser.getValue('#arrival-time-picker');
    
    browser.click('#save-top');
    
    browser.waitForVisible('#place-from');
    
    assert.equal(browser.getText('#place-from'), 'Helsinki\nFinland');
    assert.equal(browser.getText('#place-to'), 'Moscow\nRussia');
    assert.equal(browser.getText('#dept-date-value'), deptDate);
    assert.equal(browser.getText('#dept-time-value'), deptTime);
    assert.equal(browser.getText('#arr-date-value'), arrDate);
    assert.equal(browser.getText('#arr-time-value'), arrTime);
    assert.equal(browser.getText('#price-value'), `${priceAmount} ${priceCurrency}`);
    assert.equal(browser.getText('#desc-value'), description);
    assert.equal(browser.getText('#mode-value'), mode);
    assert.equal(browser.getText('#identifier-value'), identifier);
    
    if (ratings) {
      assert.equal(browser.getText('#top-score-value'), '2.5');
    }

};
