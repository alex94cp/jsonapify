var _ = require('lodash');
var async = require('async');
var common = require('./common');
var Response = require('../response');

function enumerate(/* ...args */) {
	var args = _.slice(arguments);
	
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	
	opts = _.defaults({}, opts, {
		filters: [],
	});
	
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	return middleware;
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = res.response = new Response(res);
		var err; if (err = common.checkRequest(req)) return next(err);
		invokeFilters(req, resource, response);
		getResourceData(req, response, function(err, results) {
			if (err) return next(err);
			if (!results) return next(new errors.ResourceNotFound);
			response.link('self', req.originalUrl);
			response.meta('count', results.length);
			common.wrapResults(resource, results, response, function(err, resdata) {
				if (err) return next(err);
				response.data(resdata).send();
				next();
			});
		});
	}
	
	function invokeFilters(req, resource, response) {
		_.each(opts.filters, function(filter) {
			filter(req, resource, response);
		});
	}
	
	function getResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err);
			if (_.isNull(parent)) return cb(null, null);
			var resource = last[0]; var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			resource.find(filter, cb);
		});
	}
}

module.exports = enumerate;
