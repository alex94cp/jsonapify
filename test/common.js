var _ = require('lodash');
var async = require('async');

function joinMiddleware(middleware) {
	return function(req, res, next) {
		if (!_.isArray(middleware))
			return middleware(req, res, next);
		var errorHandlers = _.filter(middleware, 'length', 4);
		middleware = _.filter(middleware, 'length', 3);
		async.eachSeries(middleware, invokeMiddleware, function(err) {
			(err && err !== 'break') ? next(err) : next();
		});
		
		function invokeMiddleware(f, cb) {
			f(req, res, function(err) {
				if (!err) return cb(null);
				var handlers = errorHandlers.slice();
				handlers.unshift(async.constant(err));
				async.waterfall(handlers, forwardError, cb);
			});
		}
	
		function forwardError(f, cb) {
			f(function(err) {
				if (!err) return cb('break');
				cb(null, err);
			});
		}
	}
}

exports.joinMiddleware = joinMiddleware;
