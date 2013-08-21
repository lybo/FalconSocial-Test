module.exports = function() {
	this.loadObj =  function( name, _ ) {
		var Obj = require(name + '.js');	
		return new Obj(_);
	};

	this.sendEmail =  function( settings ) {
		var mailer = require('mailer');

		settings.host = 'localhost';
		settings.host = '25';

		mailer.send( settings ,
		  // Your response callback
		  function(err, result) {
		    if (err) {
		      console.log(err);
		    }
		  }
		);
	};
};
