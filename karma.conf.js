module.exports = function(config) {
	
	config.set({
		frameworks: ["ui5"],
	
	    ui5: {
	      url: "https:" + "//openui5.hana.ondemand.com",
		  mode: "html",
		  testpage: [
		  	"webapp/test/testsuite.qunit.html"
	  		]
		},
		browsers: ['ChromeHeadlessNoSandbox'],
    		customLaunchers: {
      			ChromeHeadlessNoSandbox: {
        			base: 'ChromeHeadless',
        			flags: ['--no-sandbox']
      			}
    		},
	    	singleRun: true
	  });
};
