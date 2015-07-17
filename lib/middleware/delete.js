var _ = require('lodash');
var async = require('async');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');

function _delete(/* ...args */) {
	var args = _.slice(arguments);
	var opts = common.extractOpts(args, common.FULL_CHAIN);
	
	opts = _.defaults({}, opts, {
		noWait: false,
	});
	
	var pairs = _.chunk(args, 2);
	return middleware;
	
	function middleware(req, res, next) {
		var response = res.response = new Response(res);
		var err; if (err = common.checkRequest(req)) return next(err);
		common.applySelectors(pairs, req, function(err, result) {
			if (err) return next(err);
			if (!result) return next(new errors.ResourceNotFound);
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
