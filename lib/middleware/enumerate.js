var _ = require('lodash');
var async = require('async');
var common = require('./common');
var Response = require('../response');

function enumerate(/* ...args */) {
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
	
	function getResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err);
			if (!parent && !_.isEmpty(pairs)) return cb(null, null);
			var resource = last[0]; var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			resource.model.find(filter, cb);
		});
	}
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = new Response;
		response.link('self', req.originalUrl);
		getResourceData(req, response, function(err, results) {
			if (err) return next(err);
			if (!results) {
				res.status(404);
				response.data(null);
				common.sendResponse(res, response);
				return next();
			}
			response.meta('count', results.length);
			common.wrapResults(resource, results, response, function(err, resdata) {
				if (err) return next(err);
				response.data(resdata);
				common.sendResponse(res, response);
				next();
			});
		});
	}
	
	return !_.isUndefined(opts.middleware)
	           ? opts.middleware.concat(middleware)
	           : middleware;
}

module.exports = enumerate;
