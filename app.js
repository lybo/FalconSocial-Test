
/**
 * Module dependencies.
 */

var express = require('express')
  , db = { mongoose : require('mongoose') }
  , routes = require('./routes')
  , publication = require('./routes/publication')
  , chart = require('./routes/chart')
  , channel = require('./routes/channel')
  , _ = require('underscore')
  , http = require('http')
  , path = require('path')
  , app = express()
  
;

db.schema = db.mongoose.Schema;
db.ObjectId = db.mongoose.Types.ObjectId;

app.VERSION = "5.3.9";

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

db.mongoose.connect('mongodb://localhost/test-falconsocial');


app.map = function(a, route){
  	route = route || '';
  	for (var key in a) {
    	switch (typeof a[key]) {
			case 'object':
		        if( _.isArray(a[key]) ){
					app[key](route, a[key]);
				} else {
					app.map(a[key], route + key);
				}
		        break;
			case 'function':
				app[key](route, a[key]);
				break;
		}
	}
};

var server = http.createServer(app)
	, io = require('socket.io').listen(server)
;



publication(app, db, io, _);
chart(app, _);
channel(app, _);

app.get('/', function(req, res){
	res.redirect('/publications');
});


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


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




/*
websocket.sockets.on('connection', function (socket) {
	console.log('socket');
	console.log(socket);
	console.log(req.publication);
	websocket.emit('newPublication', req.publication);
	socket.on('my other event', function (data) {
	console.log(data);
	});
});
*/






