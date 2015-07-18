var _ = require('lodash');
var async = require('async');
var common = require('./common');
var Response = require('../response');

function enumerate(/* ...args */) {
	var args = _.slice(arguments);
	var opts = common.extractOpts(args, common.PARTIAL_CHAIN);
	
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
		common.initFilters(opts.filters, resource, req);
		async.waterfall([
			function(cb) {
				var err = common.checkRequest(req);
				err ? cb(err) : cb(null);
			},
			function(cb) {
				getResourceData(req, response, cb);
			},
			function(results, cb) {
				if (!results) return cb(new errors.ResourceNotFound);
				common.wrapResults(resource, results.data, response, function(err, resdata) {
					err ? cb(err) : cb(null, resdata, results.count);
				});
			},
		], function(err, resdata, count) {
			common.removeFilters(opts.filters);
			response.link('self', req.originalUrl);
			if (err) return next(err);
			response.meta('count', count).data(resdata);
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
			async.parallel({
				data: function(cb) { resource.find(filter, cb); },
				count: function(cb) { resource.find(filter).count().exec(cb); },
			}, cb);
		});
	}
}

module.exports = enumerate;
