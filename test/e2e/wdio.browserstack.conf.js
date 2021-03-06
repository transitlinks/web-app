var browserstack = require('browserstack-local');

const buildName = process.env.TRAVIS_BUILD_NUMBER ?
  ('transitlinks #' + process.env.TRAVIS_BUILD_NUMBER + '.' + process.env.TRAVIS_JOB_NUMBER) : ('transitlinks local ' + (new Date()).toJSON());

exports.config = {

    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
		specs: [
        './test/e2e/specs/**/*.js'
    ],

    exclude: [
        // 'path/to/excluded/files'
    ],

    maxInstances: 10,
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome',
        project: 'transitlinks',
        version: '44.0',
        build: buildName,
        'browserstack.local': 'true',
        'browserstack.debug': 'true'
    }],
    sync: true,
    logLevel: 'verbose',
    coloredLogs: true,
    screenshotPath: './test/e2e/screenshots',
    baseUrl: 'http://localhost:3000',
    waitforTimeout: 20000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    services: ['browserstack'],
    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
      compilers: ['js:babel-register'],
      timeout: 360000,
			ui: 'bdd'
    },

		// Code to start browserstack local before start of test
  	onPrepare: function (config, capabilities) {
      console.log("Connecting local");
    	return new Promise(function(resolve, reject){
      	exports.bs_local = new browserstack.Local();
      	exports.bs_local.start({'key': exports.config.key }, function(error) {
        	if (error) return reject(error);
        	console.log('Connected. Now testing...');
        	resolve();
      	});
    	});
  	},

  	// Code to stop browserstack local after end of test
  	onComplete: function (capabilties, specs) {
    	exports.bs_local.stop(function() {});
  	}
}
