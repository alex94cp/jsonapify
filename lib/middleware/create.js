var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');
var errorHandler = require('./errorHandler');

function create(/* ...args */) {
	var args = _.slice(arguments);
	
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	
	opts = _.defaults({}, opts, {
		noWait: false,
	});
	
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	return middleware;
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = res.response = new Response(res);
		var err; if (err = common.checkRequest(req)) return next(err);
		setResourceData(req, response, function(err, result) {
			if (err) return next(err);
			if (!result) return next(new errors.ResourceNotFound);
			if (opts.noWait) {
				response.status(202).data(null).send();
				result.save(next);
			} else {
				resource.serialize(result, response, function(err, resdata) {
					if (err) return next(err);
					if (_.has(resdata, 'links.self'))
						response.header('Location', resdata.links.self);
					result.save(function(err) {
						if (err) return next(err);
						response.status(201).data(resdata).send();
						next();
					});
				});
			}
		});
	}
	
	function setResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err);
			if (_.isNull(parent)) return cb(null, null);
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
}

module.exports = create;
