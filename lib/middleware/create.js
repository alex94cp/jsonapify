var _ = require('lodash');
var async = require('async');
var common = require('./common');
var Response = require('../response');

function create(/* ...args */) {
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
			if (err) return cb(err)
			var resource = last[0]; var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			var object = new resource.model(filter);
			resource.deserialize(req.body.data, response, object, function(err, data) {
				if (err) return cb(err);
				_.assign(object, data);
				cb(null, object);
			});
		});
	}
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = new Response;
		var object = new resource.model;
		setResourceData(req, response, function(err, object) {
			if (err) return next(err);
			if (opts.noWait) {
				res.status(202);
				response.data(null);
				common.sendResponse(res, response);
				object.save(next);
			} else {
				common.wrapResults(resource, object, response, function(err, resdata) {
					if (err) return next(err);
					if (_.has(resdata, 'links.self'))
						res.set('Location', resdata.links.self);
					object.save(function(err) {
						if (err) return next(err);
						res.status(201);
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

module.exports = create;
