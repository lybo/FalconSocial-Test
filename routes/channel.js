module.exports = function(app, _) {


	var Channel_db = require('../models/channel.js');
	_.extend(this, new Channel_db());

	// middleware: send Channels
	this.sendChannels = function(req, res) {
	   
		res.send({
			version : app.VERSION,
			response : req.channels ? req.channels : [],
			status: req.error ? 'ERROR' : 'OK',
			error: req.error
		});
			
	};

	// define routes
	app.map({
		'/channels': {
			get: [this.getChannels, this.sendChannels]
		}
	});

};
