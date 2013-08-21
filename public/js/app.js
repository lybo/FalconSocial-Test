var app = app || { }; //app namespace

$(function () {

	app.mySubscribe = function(observable, callback){
		var old;
	   
		observable.subscribe(function(oldValue){
		  old = oldValue;
		},observable,"beforeChange");

		observable.subscribe(function(newValue){
		  callback(old, newValue);
		},observable);

	};

	//
	app.loader = {
			start : function (message) {
				$("#loader").fadeIn('200');
				$("#loader-content").html( message );
			},
			end : function (message) {
								
				setTimeout(function() {
					$("#loader-content").html(message);
				}, 1000);

				setTimeout(function() {
					$("#loader").fadeOut('500');
				}, 2000);

			},
			hide : function () {
				
				$("#loader-content").html('');
				$("#loader").hide();
			}
	};

	// define Model: Channel
	app.Channel = function () {
		var that = this;
		that.id = ko.observable();
		that.name = ko.observable();
		that.mixedData = ko.computed(function() {

			
			return this.id()+'|'+this.name();
		}, that);
	};



	// define Model: Publication
	app.Publication = function () {
		var that = this;

		that.id = ko.observable();
		that.message = ko.observable();
		that.network = ko.observable();
		that.postType = ko.observable();
		that.fileName = ko.observable();
		that.fileNameUrl = ko.observable();
		that.tags = ko.observable();
		that.status = ko.observable();
		
		that.scheduled = ko.observable();
		that.channels = ko.observableArray([]);
		that.channelsHaveChanged = ko.observable(false);

		that.hasChanged = ko.observable(false);

		that.getStatus = ko.computed(function() {
	        return(that.status() === 'published' ? true : false);
	    });

	    that.getNetwork = ko.computed(function() {
	        return that.network() ? that.network().replace('+', '') : '';
	    });

	    that.getTags = ko.computed(function() {

	    	var tags = typeof that.tags() != 'undefined' ? that.tags() : '',
	    		splitedTags = typeof tags === 'string' ? tags.split(',') : tags,
	    		parsedTags = []
	    	;

	    	$.each(splitedTags, function(i, item){
	    		parsedTags.push({ value: item });
	    	});

	        return parsedTags;
	    });

		that.scheduledFriendly = ko.computed({

	        read: function () {
	            if(that.scheduled()){
					var date = moment(that.scheduled().replace('Z',''));
		            return date.format('DD/MM/YYYY - HH:mm');
		        } else {
		        	return '';
		        }
	        },
	        write: function (value) {

	            var dateData = value.replace(/\s/g, '').split('-'),
		            date = dateData[0].split('/'),
		            time = dateData[1].split(':'),
		            d = new Date(date[2], date[1], date[0], time[0], time[1], 0, 0);
		            isoDate = date[2]+'-'+date[1]+'-'+date[0]+'T'+time[0]+':'+time[1]+':00.000Z';
		        ;

	            that.scheduled(isoDate);

	        }

		});

		that.updatePublication = function (element) {

				
			var $form = $(element),
				publication = $form.serializeObject(),
				publication_id = $('.publication_id', $form).val()
			;

			app.loader.start('saving <img src="/images/ajax-loader.gif" />');
			app.ajaxService.put('publications/'+publication_id, publication, function(data){
				if(data.status == 'OK') {
					app.loader.end('Changes have sent <span class="icon icon-ok"></span>');
					that.hasChanged(false);
				} else {
	            	alert( data.error );
	            	app.loader.end('');
	            }

			});
		};

		that.removeChannel = function (channel) {

			that.channels.remove(channel);	
			that.channelsHaveChanged( that.channelsHaveChanged() ? '' : 'true' );
		};

		that.startObserve = function(){
			//, "channels"
			var properties = ["message", "network", "tags", "status", "scheduled", "channelsHaveChanged"];
			$.each(properties, function(i, prop){

				app.mySubscribe(that[prop], function(oldValue, newValue){
					
					newValue = typeof newValue === "undefined" ? '' : newValue;
					oldValue = typeof oldValue === "undefined" ? '' : oldValue;

					if(oldValue != newValue){
						that.hasChanged(true);
						$("#edit-publications").trigger('submit');
					}

				});

			});

		};

		that.createChannel = function(data){

			return new app.Channel().id(data.id).name(data.name); 
		}

	};

	// The ViewModel
	app.vm = function () {

		var 
			socket = io.connect('http://localhost:3000'),
			publications = ko.observableArray([]),
			hasPublicationChanged = ko.observable(false),
			availableNetworks = ko.observableArray(["facebook", "twitter", "google+"]),
			availableStatuses = ko.observableArray(["draft","published"]),
			selectedPublication = ko.observable(),
			canShowDetails = ko.observable(false),
			showPublicationDetails = function (publication, e) {

				var $item = $(e.currentTarget),
					$item_position = $item.position(),
					currentScrollTop = $("html").scrollTop()
				;

				$("html, body").animate({ scrollTop: ($item_position.top - 50)+'px' }, 100);
                selectedPublication(publication);
                canShowDetails(true); 
            },
            showPublications = function () {
                selectedPublication(false);
                canShowDetails(false);
            },

            publications_ids = [],

            getConfirm = function(confirmMessage, callback) {
			    confirmMessage = confirmMessage || '';

			    $('#confirmbox').modal({show:true,
			                            backdrop:false,
			                            keyboard: false,
			    });

			    $('#confirmbox h3').html(confirmMessage);
			    $('#confirmbox').off('click', '#confirmFalse');
			    $('#confirmbox').on('click', '#confirmFalse', function(e){
			        $('#confirmbox').modal('hide');
			        if (callback) callback(false);
			    });

			    $('#confirmbox').off('click', '#confirmTrue');
			    $('#confirmbox').on('click', '#confirmTrue', function(e){
			        $('#confirmbox').modal('hide');
			        if (callback) callback(true);
			    });
			},   

            addPublication = function ( data ) {
				if(data.status == 'OK') {
					var publicationData = data.response;
					
					if( publications_ids.indexOf(publicationData.id) == -1 ) {
						var publication = new app.Publication()
								.id(publicationData.id)
								.message(publicationData.content.message)
								.network('')
								.status(publicationData.status)
								.tags('')
								.scheduled('')
						;

						publications.unshift(publication);

						publication.startObserve();

						selectedPublication(publication);
		                canShowDetails(true); 

		                publications_ids.push(publication.id());

		                publications().sort(sortFunction);

		                app.loader.end('New Publication has inserted <span class="icon icon-ok"></span>');

		            } else {
		            	app.loader.hide();
		            }

	            } else {
	            	alert( data.error );
	            	app.loader.end('');
	            }
            },

			loadPublications = function () {

				app.loader.start('loading <img src="/images/ajax-loader.gif" />');
				app.ajaxService.get('publications', {}, function(data){

					if(data.status == 'OK') {
						$.each(data.response, function (i, p) {
		                  
							var publication = new app.Publication()
		                   			.id(p.id)
		                            .message(p.content.message)
		                            .network(p.content.network)
		                            .status(p.status)
		                            .tags(p.tags)
		                            .scheduled(p.scheduled)
		                            
		                    ;

		                    if(p.channels) {
		                    	$.each(p.channels, function(i, channel){

		                    		publication.channels.push(
		                    			new app.Channel()
		                    				.id(channel.id)
		                    				.name(channel.name)
		                    		);

		                    	});
		                    	
		                    }

		                    if(p.content.postType) {
		                    	publication.postType(p.content.postType);
		                    }

		                    if(p.content.media) {
		                        publication.fileName(p.content.media.fileName);
		                        publication.fileNameUrl(p.content.media.url);
		                    }

		                    publication.startObserve();

		                    publications.push(publication);
		                    publications_ids.push(publication.id());
 
		                });

						app.loader.end('Publications have loaded <span class="icon icon-ok"></span>');
		                
		                publications().sort(sortFunction);

		            } else {
		            	alert( data.error );
		            	app.loader.end('');
		            }

		            socket.on('newPublication', function (data) {
		            	app.loader.start('loading <img src="/images/ajax-loader.gif" />');
		            	addPublication(data);
		            });

				});

			},

			sortFunction = function (a, b) {
                return a.message() < b.message() ? 1 : -1;
            },

            addPublicationFromForm = function (element) {
				
				var $form = $(element),
					publication = $form.serializeObject(),
					el_message = $('.message', $form),
					publication_message = el_message.val()
				;

				if(publication_message){
					el_message.val('');
					app.loader.start('data are sending <img src="/images/ajax-loader.gif" />');
					app.ajaxService.post('publications', publication, addPublication);
	            }
				
			},

			deletePublication = function (publication) {


				getConfirm('Are sure that you want to delete this Publication?', function(result){

					if(result == true) {
						app.loader.start('data are sending <img src="/images/ajax-loader.gif" />');
						app.ajaxService.delete('publications/'+publication.id(), publication, function(data){

							if(data.status == 'OK') {

								publications_ids.splice( publications_ids.indexOf(publication.id()), 1 );


								publications.remove(publication);
								app.vm.showPublications();

								app.loader.end('Publication has deleted <span class="icon icon-ok"></span>');

							} else {
				            	alert( data.error );
				            	app.loader.end('');
				            }
						});
					}

				});
					
				
			},

			deleteImage = function (publication) {
				
				getConfirm('Are sure that you want to delete this file?', function(result){

					if(result == true){
						app.loader.start('data are sending <img src="/images/ajax-loader.gif" />');
						app.ajaxService.delete('publications/'+publication.id()+'/delete/image', {}, function(data){

							if(data.status == 'OK') {
								
								publication.postType('');
								app.loader.end('Image has deleted <span class="icon icon-ok"></span>');
							} else {
				            	alert( data.error );
				            	app.loader.end('');
				            }
						});
					}

				});

			}

			 

			
		;

		return {
            publications: publications
            ,publications_ids: publications_ids
            ,availableNetworks: availableNetworks
            ,availableStatuses: availableStatuses
            //,availableChannels: availableChannels
            ,loadPublications: loadPublications
            ,addPublicationFromForm: addPublicationFromForm
            ,addPublication: addPublication
            //,updatePublication: updatePublication
            ,deletePublication: deletePublication
            ,selectedPublication: selectedPublication
            ,showPublicationDetails: showPublicationDetails
            ,showPublications: showPublications
            ,canShowDetails: canShowDetails
            ,hasPublicationChanged: hasPublicationChanged
            ,sortFunction: sortFunction
            ,deleteImage: deleteImage
        };

	} ();

	

	
	app.vm.loadPublications();
    ko.applyBindings(app.vm);
});