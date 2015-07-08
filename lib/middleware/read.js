var _ = require('lodash');
var async = require('async');
var common = require('./common');
var Response = require('../response');

function read(/* ...args */) {
	var args = _.slice(arguments);
	
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	
	opts = _.defaults({}, opts);
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function queryModel(model, filter, req, response, cb) {
		var query = model.findOne(filter);
		if (!_.isUndefined(opts.filters)) {
			query = opts.filters.reduce(function(acc, f) {
				return f(acc, req, response);
			}, query);
		}
		return query.exec(cb);
	}
	
	function getResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			var resource = last[0];
			var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			queryModel(resource.model, filter, req, response, function(err, result) {
				err ? cb(err) : cb(null, resource, result);
			});
		});
	}
	
	function middleware(req, res, next) {
		var response = new Response;
		response.link('self', req.originalUrl);
		getResourceData(req, response, function(err, resource, result) {
			if (err) return next(err);
			common.wrapResults(resource, result, response, function(err, resdata) {
				if (err) return next(err);
				if (!resdata) res.status(404);
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

module.exports = read;