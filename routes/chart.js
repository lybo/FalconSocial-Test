module.exports = function(app, _) {

	var Impressions_db = require('../models/impressions.js');
	_.extend(this, new Impressions_db());

	// middleware: send Impressions
	this.sendImpressions = function(req, res){

		res.format({
			html: function() {
				res.render('chart_index', {
					post_impressions : {
						"version": app.VERSION,
						"response": req.impressions,
						"status": "OK",
						"error": ""
					},
					menu : [
						{url : '/publications', name : 'Publications', active : false }, 
						{url : '/charts', name : 'Charts', active : true } 
					]
				});
			},
			json: function() {
				
				res.send({
					"version": app.VERSION,
					"response": req.impressions,
					"status": "OK",
					"error": ""
				});
			}
		});
	};

	// middleware: send New Impressions
	this.sendNewImpressions = function(req, res){
	
		// trigger impressions:new for websocket
	    app.emit('impressions:new', {
			version : app.VERSION,
			response : req.impressions,
			status: req.error ? 'ERROR' : 'OK',
			error: req.error
		});

		res.send({
			"version": app.VERSION,
			"response": req.impressions,
			"status": "OK",
			"error": ""
		});
			
	};

	// define routes
	app.map({
		'/charts': {
			get: [this.getImpressions, this.sendImpressions],
		},
		'/get_impressions': {
			get: [this.getImpressions, this.sendImpressions],
		},
		'/get_new_impressions': {
			get: [this.getNewImpressions, this.sendNewImpressions],
		},
	});

};