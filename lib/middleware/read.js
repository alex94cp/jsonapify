var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');

function read(/* ...args */) {
	var args = _.slice(arguments);
	var opts = common.extractOpts(args, common.FULL_CHAIN);
	
	opts = _.defaults({}, opts, {
		filters: [],
	});
	
	if (!_.isArray(opts.filters))
		opts.filters = [opts.filters];
	
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	return middleware;
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = res.response = new Response(res);
		var err; if (err = common.checkRequest(req)) return next(err);
		invokeFilters(req, resource, response);
		getResourceData(req, response, function(err, result) {
			if (err) return next(err);
			if (!result) return next(new errors.ResourceNotFound);
			response.link('self', req.originalUrl);
			common.wrapResults(resource, result, response, function(err, resdata) {
				if (err) return next(err);
				if (!resdata) response.status(404);
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
			resource.findOne(filter, cb);
		});
	}
}

module.exports = read;
