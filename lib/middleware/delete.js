var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');

function _delete(/* ...args */) {
	var args = _.slice(arguments);
	
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	
	var pairs = _.chunk(args, 2);
	
	opts = _.defaults({}, opts, {
		noWait: false,
	});
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function middleware(req, res, next) {
		var response = new Response;
		common.applySelectors(pairs, req, function(err, result) {
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
				result.remove(next);
			} else {
				result.remove(function(err) {
					if (err) return next(err);
					res.status(204);
					response.data(null);
					common.sendResponse(res, response);
					next();
				});
			}
		});
	}
	
	return !_.isUndefined(opts.middleware)
	           ? opts.middleware.concat(middleware)
	           : middleware;
}

module.exports = _delete;
