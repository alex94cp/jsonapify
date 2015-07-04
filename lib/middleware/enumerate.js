var _ = require('lodash');
var async = require('async');
var Response = require('../response');

function enumerate(resource, opts) {
	opts = opts || {};
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.filters))
	    	opts.filters = [opts.filters];
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function initQuery() {
		var model = resource.model;
		return model.find();
	}
	
	function queryModel(req, response, cb) {
		var query = initQuery();
		if (!_.isUndefined(opts.filters)) {
			query = opts.filters.reduce(function(acc, f) {
				return f(acc, req, response);
			}, query);
		}
		query.exec(cb);
	}
	
	function wrapResults(results, response, cb) {
		async.map(results, function(object, cb) {
			resource.serialize(object, response, cb);
		}, cb);
	}
	
	function middleware(req, res, next) {
		var response = new Response;
		response.link('self', req.originalUrl);
		queryModel(req, response, function(err, results) {
			if (err) return next(err);
			response.meta('count', results.length);
			wrapResults(results, response, function(err, resdata) {
				if (err) return next(err);
				response.data(resdata);
				res.json(response);
				next();
			});
		});
	}
	
	return !_.isUndefined(opts.middleware)
	           ? opts.middleware.concat(middleware)
	           : middleware;
}

module.exports = enumerate;
