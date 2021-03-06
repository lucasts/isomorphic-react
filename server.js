/* jshint node:true, es3:false */

"use strict";

require('node-jsx').install({ extension: '.jsx' });

var express = require('express'),
		path = require('path'),
		expressState = require('express-state'),
		compression	= require('compression'),
		bodyParser = require('body-parser'),
		debug = require('debug')('server:'),
		logger = require('morgan'),
		React = require('react'),
		Router = require('react-router'),
		async = require('async'),
		server = express(),
		app = require('./app'),
		port = process.env.PORT || 5000,
		devPort = port+1

if(server.get('env') === 'development'){
	server.use(logger('dev'));
}else{
	server.use(logger('tiny'));
}

// exposing some jade locals for templating purposes
if(server.get('env') === 'development'){
	server.locals.devPort = devPort; 
}else{
	// pass to template for linking
	try{
		var stats = require('./build/stats.json');
		server.locals.hash = stats.hash;
	}catch(e){

	}
}

// view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');
server.set('state namespace', app.uid);

server.use(bodyParser.json()); // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies
server.use(compression({ filter: function(args) { return true; } })); // compress all requests and types

// requesting static files with different priority
server.use(express.static(__dirname + '/build'));
server.use(express.static(__dirname + '/static'));

expressState.extend(server);
	

// middleware to handle server side rendering
server.use(function (req, res, next) {
	var context = app.createContext({
		api: process.env.API || 'https://api.spotify.com/v1',
		env: {
			NODE_ENV: process.env.NODE_ENV
		}
	});
	
	debug('Loading application data');

	Router.run(app.getAppComponent(), req.url, function (Handler, state) {
	
		if(state.routes.length === 0) { 
			// no such route, pass to the next middleware which handles 404
			return next();
		}
		
		async.filterSeries(
			state.routes.filter(function(route) {
				return route.handler.loadAction?true:false;
			}),
			function(route, done) {
				context.getActionContext().executeAction(route.handler.loadAction, {params:state.params, query:state.query}, done);
			},
			function() {
				debug('Rendering application components');
				var markup = React.renderToString(React.createElement(Handler, {context: context.getComponentContext()}));
				res.expose(app.dehydrate(context), app.uid);
				res.render('index', {
					uid: app.uid,
					html: markup
				}, function (err, markup) {
					if (err) {
						next(err);
					}
					res.send(markup);
				});
			}
		);
	});
});

// catch 404 and forward to error handler
server.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (server.get('env') === 'development') {
    server.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
server.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


server.listen(port, function() {
	console.log("Running in %s and listening on %s", __dirname, port);
});

module.exports = server;
