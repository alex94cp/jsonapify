var _ = require('lodash');
var async = require('async');
var common = require('./common');
var Response = require('../response');

function update(/* ...args */) {
	var args = _.slice(arguments);
	
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	
	opts = _.defaults({}, opts, {
		noWait: false,
	});
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function updateResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err)
			var resource = last[0];
			var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			resource.model.findOne(filter, function(err, object) {
				if (err) return cb(err);
				if (!object) return cb(null, null);
				resource.deserialize(req.body.data, response, object, cb);
			});
		});
	}
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = new Response;
		updateResourceData(req, response, function(err, object) {
			if (err) return next(err);
			if (opts.noWait) {
				response.data(null);
				res.status(202).json(response);
				object.save(next);
			} else {
				common.wrapResults(resource, object, response, function(err, resdata) {
					if (err) return next(err);
					if (!resdata) res.status(404);
					response.data(resdata);
					res.json(response);
					next();
				});
			}
		});
	}
	
	return !_.isUndefined(opts.middleware)
	           ? opts.middleware.concat(middleware)
	           : middleware;
}

module.exports = update;
