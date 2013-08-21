(function () {

    ko.bindingHandlers.inputTags = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            
            var data = valueAccessor(),
                allBindings = allBindingsAccessor()
            ;

            $(element).tagsInput({
                'onChange' : function(){
                    $(element).trigger('change');
                }
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            
            var data = valueAccessor(),
                allBindings = allBindingsAccessor()
            ;

            if(!data){
                data = '';
            }
            
            if(typeof data != 'string') {
                data = data.join(',');
            }

            $(element).importTags(data);
            
        }
    };


    ko.bindingHandlers.inputTagsById = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            
            var $data = valueAccessor(),
                allBindings = allBindingsAccessor(),
                items = {},
                names = [],
                channelsHaveChanged = $data.channelsHaveChanged,
                channels = $data.channels()
            ;

            

            $('.typehead', element).typeahead({
                source: function (query, process) {


                    if( !names.length ) {
                        app.ajaxService.get('channels', {}, function(data){

                            if(data.status == 'OK') {
                                $.each(data.response, function (i, item) {
                                  
                                    names.push(item.name);

                                });

                                items = data.response;

                                process(names);

                            }

                        });
                    } else {
                        process(names);
                    }
  
                },

                
                updater: function(name) {

                    var selectedItem;
                    var isExist = false;

                    $.each(items, function (i, item) {
                        if(item.name == name){
                            $.each(channels, function(i ,channel){
                                if(channel.id() == item.id) {
                                    isExist = true;
                                }
                            })
                            if(!isExist) {
                                selectedItem = item;
                            }
                        }
                    });


                    if(!isExist) {

                        $data.channels.push($data.createChannel(selectedItem));
                        channelsHaveChanged( channelsHaveChanged() ? '' : 'true' );

                    }

                    return '';
                }

            });
            
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            
            
            
        }
    };

    ko.bindingHandlers.slideVisible = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            
            var 
                value = valueAccessor(),
                allBindings = allBindingsAccessor(),
                valueUnwrapped = ko.utils.unwrapObservable(value),
                duration = allBindings.slideDuration || 400
            ;

            if (valueUnwrapped == true) {
                $(element).slideDown(duration); 
            } else {
                $(element).slideUp(duration); 
            }

        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            var 
                value = valueAccessor(),
                allBindings = allBindingsAccessor(),
                valueUnwrapped = ko.utils.unwrapObservable(value),
                duration = allBindings.slideDuration || 400
            ;

            if (valueUnwrapped == true) {
                $(element).slideDown(duration); 
            } else {
                $(element).slideUp(duration); 
            }
        }
    };

    ko.bindingHandlers.fadeVisible = {
        init: function (element, valueAccessor) {
            
            var shouldDisplay = valueAccessor(),
                duration =  500;

            alert('');

            shouldDisplay ? $(element).fadeIn(duration) : $(element).fadeOut(duration);
        },
        update: function (element, valueAccessor) {
            // On update, fade in/out
            var shouldDisplay = valueAccessor(),
                duration =  500;

            alert('');

            shouldDisplay ? $(element).fadeIn(duration) : $(element).fadeOut(duration);
        }
    };

    ko.bindingHandlers.dateIso = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

            //http://momentjs.com/docs/

            var value = ko.unwrap(valueAccessor()),
                allBindings = allBindingsAccessor(),
                dateFormat = allBindings.dateFormat || "DD/MM/YYYY"
            ;
            if(value) {
                var date = moment(value.replace('Z',''));
                
                $(element).text(date.format(dateFormat));
            }
           
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

            var value = ko.unwrap(valueAccessor()),
                allBindings = allBindingsAccessor(),
                dateFormat = allBindings.dateFormat || "DD/MM/YYYY"
            ;
            if(value) {
                var date = moment(value.replace('Z',''));
                
                $(element).text(date.format(dateFormat));
            }
            
        }
    };

    ko.bindingHandlers.affix = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            $(element).affix();
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            $(element).affix().width($(element).parent().width());
        }
    };

    ko.bindingHandlers.inputUploader = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

            var value = ko.unwrap(valueAccessor()),
                allBindings = allBindingsAccessor(),
                url = allBindings.url
            ;

            if(url) {

                $(element).fileupload({
                    url: url+'/'+value,
                    dataType: 'json',
                    add: function (e, data) {
                        
                        app.loader.start('uploading...');
                        data.submit();
                    },
                    done: function (e, data) {
                       

                        var dataResult = data.result;

                        if( dataResult.status == 'OK' ) {

                            var dataResponse = dataResult.response;

                            $(e.target).parent().after(dataResponse.postType+': <a href="'+dataResponse.media.url+'">'+dataResponse.media.fileName+'</a>'+'<input type="hidden" name="content[media][fileName]" value"'+dataResponse.media.fileName+'"/><input type="hidden" name="content[media][url]" value"'+dataResponse.media.url+'"/><input type="hidden" name="content[postType]" value"'+dataResponse.postType+'""/>');

                            viewModel.fileName(dataResponse.media.fileName);
                            viewModel.fileNameUrl(dataResponse.media.url);
                            viewModel.postType(dataResponse.postType);
                            
                            app.loader.end('The file has uploaded');

                            $(e.target).parent().remove();
                            
                        } else {
                            app.loader.end('');
                        }
                    }
                });
            } else {
                alert("Url is required for the binding uploader");
            }
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        }
    };

    ko.bindingHandlers.datetimePicker = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

            var value = ko.unwrap(valueAccessor())
                ,allBindings = allBindingsAccessor()
                ,url = allBindings.url
            ;

            $(element).data('date', value);
            $(element).datetimepicker({
                weekStart: 1,
                todayBtn:  1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                forceParse: 0,
                showMeridian: 1,
                pickerPosition: 'top-right'
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        }
    };

    ko.bindingHandlers.fixedWidthbyParent = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            
            var data = valueAccessor(),
                allBindings = allBindingsAccessor()
            ;

            $(element).width($(element).parent().width());

            $(window).resize(function(){
                //console.log('aaaaaa');
                $(element).width($(element).parent().width());
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            
            
        }
    };

    ko.bindingHandlers.fixedHeight = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            
            var data = valueAccessor(),
                allBindings = allBindingsAccessor(),
                declinedHeight = parseInt(allBindings.declinedHeight || 0),
                $device = $(window)
            ;


            $(element).height( $device.height() - declinedHeight );
            $(element).css('overflow', 'auto');

            $device.resize(function(){

                $(element).height( $device.height() - declinedHeight );

            });
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            
            
        }
    };


})();