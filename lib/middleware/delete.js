var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');
var errorHandler = require('./errorHandler');

function _delete(/* ...args */) {
	var args = _.slice(arguments);
	var opts = undefined;
	if (common.isOptions(_.last(args)))
		opts = args.pop();
	var pairs = _.chunk(args, 2);
	opts = _.defaults({}, opts, {
		noWait: false,
	});
	return middleware;
	
	function middleware(req, res, next) {
		var response = new Response(res);
		common.applySelectors(pairs, req, function(err, result) {
			if (err) return next(err);
			if (!result) {
				response.error(new errors.ResourceNotFound).send();
				return next();
			}
			if (opts.noWait) {
				response.status(202).data(null).send();
				result.remove(next);
			} else {
				result.remove(function(err) {
					if (err) return next(err);
					response.status(204).data(null).send();
					next();
				});
			}
		});
	}
}

module.exports = _delete;
