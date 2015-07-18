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
		common.initFilters(opts.filters, req, resource);
		async.waterfall([
			function(cb) {
				var err = common.checkRequest(req);
				err ? cb(err) : cb(null);
			},
			function(cb) {
				getResourceData(req, response, cb);
			},
			function(data, cb) {
				if (!data) return cb(new errors.ResourceNotFound);
				common.wrapResults(resource, data, response, cb);
			},
		], function(err, resdata) {
			common.removeFilters(opts.filters);
			response.link('self', req.originalUrl);
			if (err) return next(err);
			if (!resdata) response.status(404);
			response.data(resdata);
			common.addFilterInfo(opts.filters, req, response);
			response.send();
			next();
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
