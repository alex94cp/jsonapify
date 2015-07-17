var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');

function assign(/* ...args */) {
	var args = _.slice(arguments);
	var opts = common.extractOpts(args, common.FULL_CHAIN);
	
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
		setResourceData(req, response, function(err, object, created) {
			if (err) return next(err);
			if (!object) return next(new errors.ResourceNotFound);
			if (opts.noWait) {
				response.status(202).data(null).send();
				object.save(next);
			} else {
				object.save(function(err) {
					if (err) return next(err);
					resource.serialize(object, response, function(err, resdata) {
						if (err) return next(err);
						if (created) response.status(201);
						response.data(resdata).send();
						next();
					});
				});
			}
		});
	}
	
	function setResourceData(req, response, cb) {
		common.applySelectors(pairs, req, function(err, parent) {
			if (err) return cb(err)
			if (_.isNull(parent)) return cb(null, null);
			var resource = last[0]; var selector = last[1];
			var filter = common.resolveSelector(selector, req, parent);
			resource.findOne(filter, function(err, object) {
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
}

module.exports = assign;
