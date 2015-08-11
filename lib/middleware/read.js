var _ = require('lodash');
var async = require('async');

var common = require('./common');
var filters = require('../filters');
var ResourceNotFound = require('../errors/ResourceNotFound');

var defaultOpts = {
	strict: false,
	filters: [
		filters.select(),
		filters.sort(),
	],
};

function read(chain, opts) {
	opts = _.defaults({}, opts, defaultOpts);
	chain = common.parseChain(chain);
	return middleware;

	function middleware(req, res, next) {
		var lastLink = _.last(chain);
		var resource = lastLink.resource;
		var transaction = common.initTransaction(resource, res);
		_.each(opts.filters, function(filter) { filter(transaction) });
		transaction.notify(resource, 'start', req);
		async.waterfall([
			function(next) {
				common.applyChain(transaction, chain, req, next);
			},
			function(object, next) {
				var resview = resource.view(transaction);
				resview.serialize(object, next);
			},
		], function(err, resdata) {
			if (err) return next(err);
			var response = transaction.response;
			response.links.self = req.originalUrl;
			response.data = resdata;
			transaction.notify(resource, 'end');
			response.send();
			next();
		});
	}
}

module.exports = exports = read;
exports.defaultOptions = defaultOpts;
