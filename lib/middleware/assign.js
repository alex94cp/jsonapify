var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');
var errorHandler = require('./errorHandler');

function assign(/* ...args */) {
	var args = _.slice(arguments);
	
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	
	opts = _.defaults({}, opts, {
		noWait: false,
		middleware: errorHandler(),
	});
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function setResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err)
			if (_.isNull(parent)) return cb(null, null);
			var resource = last[0]; var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			resource.model.findOne(filter, function(err, object) {
				if (err) return cb(err);
				var created = false;
				if (!object) {
					object = new resource.model(filter);
					created = true;
				}
				resource.deserialize(req.body.data, response, object, function(err) {
					err ? cb(err) : cb(null, object, created);
				});
			});
		});
	}
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = new Response;
		setResourceData(req, response, function(err, object, created) {
			if (err) return next(err);
			if (!object) {
				response.error(new errors.ResourceNotFound);
				common.sendResponse(res, response);
				return next();
			}
			if (opts.noWait) {
				res.status(202);
				response.data(null);
				common.sendResponse(res, response);
				object.save(next);
			} else {
				object.save(function(err) {
					if (err) return next(err);
					resource.serialize(object, response, function(err, resdata) {
						if (err) return next(err);
						response.data(resdata);
						if (created) res.status(201);
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

module.exports = assign;
