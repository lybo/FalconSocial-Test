# FalconSocial-Test

## Commence the application

* node app.js
* running in: http://localhost:3000/

## Requirements

* [mongoDB](http://www.mongodb.org/)
* [install mongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/)

## About the 1st Part of the Test

### Notes
* I have used lesscss only in my stylesheet `public/css/styles.less` because I couldn't find the less files of the bootstrap 2.3.2. Now, it's released the new version bootstrap 3. 
* My knockout app is in `public/js/app.js`. 
* When the app renders the html file, it passes as hardcoded the list of publications but the list doesn't effect the application. I did that in order to create 2 versions. The first one should have run in full ajax implementation and the second one should have load the list by one less request from the server. So, just ignore this part
 `window.publications = [...];`.
* Field `Channels`: I have created endpoint which provide a hardcoded list of channels `http://localhost:3000/channels`

### js Plugins
* [Bootstrap 2.3.2](http://getbootstrap.com/2.3.2/)
* [bootstrap.datetimepicker](https://github.com/smalot/bootstrap-datetimepicker)
* [jquery.tags_input_master](https://github.com/xoxco/jQuery-Tags-Input)
* [jQuery-File-Upload-master](http://blueimp.github.io/jQuery-File-Upload/basic.html)
* [moment](http://momentjs.com/)	

### Websocket
file: `routes/publication.js` -> middleware: `this.sendNewPublication`

	// trigger publication:new for websocket
    app.emit('publication:new', {
		version : app.VERSION,
		response : req.publication,
		status: req.error ? 'ERROR' : 'OK',
		error: req.error
	});

There is a listener at file: `app.js`

	io.sockets.on('connection', function (socket) {

		app.on('publication:new', function (data) {

			setTimeout(function() {
				socket.emit('newPublication', data);
			}, 2000);

		});

		app.on('impressions:new', function (data) {

			socket.emit('newImpressions', data);

		});

	});

## About the 2st Part of the Test (Chart)


### Files

* `public/js/chart.js`
* `public/css/chart.less`


### Websocket

The same as above. I you want to check the result you can do a request `http://localhost:3000/get_new_impressions` and see the results.