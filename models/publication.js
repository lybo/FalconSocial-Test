module.exports = function(db){

    
	// define publication schema
	var publication_id = db.schema.ObjectId;
	var publicationSchema = db.schema({
		id: publication_id,
		content:{
			message: String,
			id: publication_id,
			network: String,
			postType: String,
			media:{
				fileName: String,
				url: String
			}
		},
		tags: [],
		status: String,
		channels:[{
			name: String,
			id: String
		}],
		scheduled: String
	});

	// define publication model
	var Publication = db.mongoose.model('Publication', publicationSchema);


	// middleware: get publication 
    this.setDefaultData = function(req, res, next) {
         
        var default_data =  new Publication({
            id: '52145f0db6b08e790f000004',
            content:{
                message:"Her er den perfekte gave",
                id: '52145f0db6b08e790f000004',
                network:"facebook",
                postType:"photo",
                media:{
                    fileName:"konfirmationsgave til hende.jpg",
                    url:"http://s3.amazonaws.com/mingler.falcon.scheduled_post_pictures/25c69cba-8881-4147-9fc9-d61a9c2de676"
                }
            },
            tags:["converstaion","sales"],
            status:"draft",
            channels:[{"name":"Konfirmanden","id":433104606739910}],
            scheduled:"2013-08-08T08:00:00.000Z"
        });

        Publication.findOne({id: '52145f0db6b08e790f000004' }, function(err, publication){
            if (err) {
                
                req.error = "setDefaultData"+err;
                console.log("setDefaultData"+err);
                next();

            } else {
                
                if(!publication) {
                    default_data.save(function(err){
                        if (err) {
                            req.error = "setDefaultData"+err;
                            console.log("setDefaultData"+err);

                        }  
                        next();
                    });
                } else {
                    next();
                }

            }
                
        });

    };

    // middleware: get publication 
	this.getPublication = function(req, res, next) {
         
        Publication.findOne(
        	{id: req.publicationId}, 
        	function(err, publication){
        	if (err) {
        		console.log("getPublication"+err);
                req.error = "getPublication";
                next();
        	} else {
	        	req.publication = publication;
				next();
			}
		});

    };

    // middleware: get publications 
    this.getPublications = function(req, res, next) {

    	/*Publication.remove({_id:'520c3114fe9e0acf3e000002'}, function(err, publications){
        	if (err) {
        		console.log(err);
        	} else {

			}
		});*/

        Publication.find({}, function(err, publications){
        	if (err) {
        		console.log("getPublications"+err);
                req.error = "getPublications";
                next();
        	} else {
	        	req.publications = publications;
				next();
			}
		});

        
    };

    // middleware: insert a new publication
    this.insertPublication = function(req, res, next) {
         
    	var newPublication = new Publication(req.body);

    	newPublication.id = newPublication._id;
    	newPublication.content.id = newPublication._id;

        
        newPublication.save(function(err){
        	if (err) {
                req.error = "insertPublication";
        		console.log("insertPublication"+err);
                next();
        	} else {

	        	req.publication = newPublication;
				next();
			}
		}); 

    };

    // middleware: update publication
    this.updatePublication = function(req, res, next) {
         
        var updatedPublication = req.body;


        // set the same id to field content.id
        updatedPublication.content.id = req.publicationId;

        // convert string tags in array
        updatedPublication.tags = updatedPublication.tags.split(',');
        
        // convert a friendly date format to iso format
        if(updatedPublication.scheduled) {
            var dateData = updatedPublication.scheduled.replace(/\s/g, '').split('-'),
                date = dateData[0].split('/'),
                time = dateData[1].split(':'),
                d = new Date(date[2], date[1], date[0], time[0], time[1], 0, 0);
                isoDate = date[2]+'-'+date[1]+'-'+date[0]+'T'+time[0]+':'+time[1]+':00.000Z';
            ;

            updatedPublication.scheduled = isoDate;
        }


        // covert all channels to propert object format
        var channels = [],
            channel = []
        ;
        if( updatedPublication.channels && updatedPublication.channels.length ) {
            updatedPublication.channels.forEach(function(channelMixedData){

                if( channelMixedData ) {

                    channel = channelMixedData.split('|');
                    channels.push({id: channel[0], name: channel[1]});
                    
                }

            });
        }
        updatedPublication.channels = channels;

        
        // save tha changes in DB 
        Publication.update(
        	{id: req.publicationId}
        	, updatedPublication
        	, function(err, result){
        	if (err) {
        		console.log("updatePublication"+err);
                req.error = "updatePublication";
                next();
        	} else {

	        	req.publication = updatedPublication;
				next();
			}
		}); 
    };

    // middleware: delete publication
    this.deletePublication = function(req, res, next) {
         
        Publication.remove({ id: req.publicationId }, function(err) {
            if (err) {
                console.log("deletePublication"+err);
                req.error = "deletePublication";
                next();
            }
            else {
                if( req.publication.content.postType ) {
                    req.fileName = req.publicationId+'.'+req.publication.content.media.fileName.split('.').pop();
                }
                next();
            }
        }); 
        

    };

    // middleware: update publication Image
    this.updatePublicationImage = function(req, res, next) {
         
        req.publication.content.media = {
                        url: req.file.url,
                        fileName: req.file.name
        };

        req.publication.content.postType = req.file.type;    

        
        req.publication.save(function (err) {
            if (err) {
                console.log("updatePublicationImage"+err);
                req.error = "updatePublicationImage";
                next();
            } else {
                next();
            }
        });
        
    };

    // middleware: remove from DB the current publication Image
    this.removePublicationImage = function(req, res, next) {
         
        req.fileName = req.publicationId+'.'+req.publication.content.media.fileName.split('.').pop();

        req.publication.content.media = {
                        url: '',
                        fileName: ''
        };

        req.publication.content.postType = '';    

        req.publication.save(function (err) {
            if (err) {
                console.log("removePublicationImage"+err);
                req.error = "removePublicationImage";
                next();
            } else {
                next();
            }
        });
        
    };

    // middleware: pass the publicationId as image name
    this.imagePublication = function(req, res, next) {
         
        req.imageName = req.publicationId;

        next();
    };
};