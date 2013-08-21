module.exports = function(app, db, io, _) {
 	
	var Publication_db = require('../models/publication.js');
	_.extend(this, new Publication_db(db));

	var Channel_db = require('../models/channel.js');
	_.extend(this, new Channel_db());

	var General = require('../models/general.js');
	_.extend(this, new General(_));
	
	// middleware: (the template is empty)
	this.sendCreateFormPublication = function(req, res) {
		res.render('create_form_publication');	
	};

	// middleware: (the template is empty)
	this.sendEditFormPublication = function(req, res) {
		res.render('edit_form_publication');		
	};

	// middleware: sendNewPublication
	this.sendNewPublication = function(req, res) {
	   
	   	// trigger publication:new for websocket
	    app.emit('publication:new', {
			version : app.VERSION,
			response : req.publication,
			status: req.error ? 'ERROR' : 'OK',
			error: req.error
		});

	    res.format({
			html: function() {

			},
			json: function() {
				res.send({
					version : app.VERSION,
					response : req.publication,
					status: req.error ? 'ERROR' : 'OK',
					error: req.error
				});
			}
		});
	};

	// middleware: sendUpdatedPublication
	this.sendUpdatedPublication = function(req, res) {
	    
	    //res.send(req.publication);
	    res.send({
			version : app.VERSION,
			response : req.publication,
			status: req.error ? 'ERROR' : 'OK',
			error: req.error
		});
	};

	// middleware: sendPublications
	this.sendPublications = function(req, res) {
	    res.format({
			html: function() {
				res.render('publication_index', {
					publications : req.publications,
					menu : [
						{url : '/publications', name : 'Publications', active : true }, 
						{url : '/charts', name : 'Charts', active : false } 
					]
				});
			},
			json: function() {
				res.send({
					version : app.VERSION,
					response : req.publications,
					status: req.error ? 'ERROR' : 'OK',
					error: req.error
				});
			}
		});
	};

	// middleware: sendPublication
	this.sendPublication = function(req, res) {
	    res.format({
			html: function() {
				//res.send('publication: ' + req.publication.email);
			},
			json: function() {
				
				res.send({
					version : app.VERSION,
					response : req.publication,
					status: req.error ? 'ERROR' : 'OK',
					error: req.error
				});
			}
		});
			
	};

	// middleware: sendUploadedFile
	this.sendUploadedFile = function(req, res) {
		
		res.send({
			version : app.VERSION,
			response : {
	        	media: {
	                url: req.file.url,
	                fileName: req.file.name
	            },
	            postType: req.file.type
	        },
			status: req.error ? 'ERROR' : 'OK',
			error: req.error
		});

    };

    // middleware: sendUploadedFile
    this.sendDeletedPublication = function(req, res) {

        res.send({
			version : app.VERSION,
			response : { success: true },
			status: req.error ? 'ERROR' : 'OK',
			error: req.error
		});
    };

    // middleware: confirm publicationId
	app.param('publicationId', function(req, res, next, publicationId){
    
	    if (publicationId) {
			req.publicationId = publicationId;
 			next();
	    } else {
			next(new Error("No publication found"));
	    }

	});

	// define routes
	app.map({
		'/publications': {
			get: [this.setDefaultData, this.getPublications, this.sendPublications],
			post: [this.insertPublication, this.sendNewPublication],
			'/create': { 
				get: [this.sendCreateFormPublication]
			},
			'/:publicationId':{ 
				get: [this.getPublication, this.sendPublication],
				put: [this.getChannels, this.updatePublication, this.getPublication, this.sendUpdatedPublication],
				delete: [this.getPublication, this.deletePublication, this.deleteFile, this.sendDeletedPublication],
				'/edit':{
					get: [this.sendEditFormPublication]
				},
				'/delete/image':{
					delete: [this.getPublication, this.removePublicationImage, this.deleteFile, this.sendPublication]
				}
			},
			'/upload': {
				'/:publicationId':{ 
	            	post: [this.imagePublication, this.uploadFile, this.getPublication, this.updatePublicationImage, this.sendUploadedFile] 
	            } 
	        }
		}
	});

/*
-------------------------------------
RESTful
-------------------------------------

GET         /publications            index         publications.index
GET         /publications/create     create        publications.create
POST        /publications            store         publications.store
GET         /publications/{id}       show          publications.show
GET         /publications/{id}/edit  edit          publications.edit
PUT/PATCH   /publications/{id}       update        publications.update
DELETE      /publications/{id}       destroy       publications.destroy
*/



};
