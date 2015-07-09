var _ = require('lodash');
var async = require('async');
var common = require('./common');
var Response = require('../response');

function _delete(/* ...args */) {
	var args = _.slice(arguments);
	
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	
	var pairs = _.chunk(args, 2);
	var last = pairs.pop();
	
	var fullChain = pairs.slice();
	fullChain.push(last);
	
	opts = _.defaults({}, opts, {
		noWait: false,
	});
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function middleware(req, res, next) {
		var resource = last[0];
		var response = new Response;
		common.applySelectors(fullChain, req, function(err, result) {
			if (err) return next(err);
			if (!result) {
				response.data(null);
				res.status(404).json(response);
				next();
			}
			if (opts.noWait) {
				response.data(null);
				res.status(202).json(response);
				result.remove(next);
			} else {
				result.remove(function(err) {
					if (err) return next(err);
					response.data(null);
					res.status(204).json(response);
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
