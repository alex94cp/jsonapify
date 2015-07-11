var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
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
	
	function setResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err);
			if (_.isNull(parent)) return cb(null, null);
			var resource = last[0]; var selector = last[1];
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
		setResourceData(req, response, function(err, result) {
			if (err) return next(err);
			if (!result) {
				response.error(new errors.ResourceNotFound);
				common.sendResponse(res, response);
				return next();
			}
			if (opts.noWait) {
				res.status(202);
				response.data(null);
				common.sendResponse(res, response);
				result.save(next);
			} else {
				result.save(function(err) {
					if (err) return next(err);
					resource.serialize(result, response, function(err, resdata) {
						if (err) return next(err);
						response.data(resdata);
						common.sendResponse(res, response);
						next();
					});
				});
			}
		});
	}
	
	return !_.isUndefined(opts.middleware)
	           ? opts.middleware.concat(middleware)
	           : middleware;
}

module.exports = update;
