var selenium = require('selenium-standalone');
var seleniumServer;

exports.config = {
   
  host: 'localhost',
  port: 4444, 
  specs: [
    //'./test/e2e/specs/**/*.js'
    './test/e2e/specs/viewLinkInstance.js'
  ],
  
  // Patterns to exclude.
  exclude: [
  ],
  
  maxInstances: 10,
  capabilities: [{
    maxInstances: 5,
    browserName: 'chrome'
  }],

  sync: true,
  
  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './test/e2e/screenshots',
  baseUrl: 'http://localhost:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  
  framework: 'mocha',
  reporters: ['spec'],
    
  mochaOpts: {
    compilers: ['js:babel-register'],
    timeout: 60000,
    ui: 'bdd'
  },

  onPrepare: function() {
    return new Promise((resolve, reject) => {
      selenium.start((err, process) => {
        if(err) {
          return reject(err);
        }
        seleniumServer = process;
        resolve(process);
      })
    });
  },

  onComplete: function(exitCode) {
    seleniumServer.kill();
  }    
      
}
