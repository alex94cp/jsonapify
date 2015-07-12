var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');
var errorHandler = require('./errorHandler');

function update(/* ...args */) {
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
	return middleware;
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = new Response(res);
		setResourceData(req, response, function(err, result) {
			if (err) return next(err);
			if (!result) {
				response.error(new errors.ResourceNotFound).send();
				return next();
			}
			if (opts.noWait) {
				response.status(202).data(null).send();
				result.save(next);
			} else {
				result.save(function(err) {
					if (err) return next(err);
					resource.serialize(result, response, function(err, resdata) {
						if (err) return next(err);
						response.data(resdata).send();
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
			resource.model.findOne(filter, function(err, object) {
				if (err) return cb(err);
				if (!object) return cb(null, null);
				resource.deserialize(req.body.data, response, object, cb);
			});
		});
	}
}

module.exports = update;
