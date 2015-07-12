var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');
var errorHandler = require('./errorHandler');

function read(/* ...args */) {
	var args = _.slice(arguments);
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	opts = _.defaults({}, opts);
	return middleware;
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = new Response(res);
		response.link('self', req.originalUrl);
		getResourceData(req, response, function(err, result) {
			if (err) return next(err);
			if (!result) {
				response.error(new errors.ResourceNotFound).send();
				return next();
			}
			common.wrapResults(resource, result, response, function(err, resdata) {
				if (err) return next(err);
				if (!resdata) response.status(404);
				response.data(resdata).send();
				next();
			});
		});
	}
	
	function getResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err);
			if (_.isNull(parent)) return cb(null, null);
			var resource = last[0]; var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			resource.model.findOne(filter, cb);
		});
	}
}

module.exports = read;
