var _ = require('lodash');
var async = require('async');

var common = require('./common');
var filters = require('../filters');

var defaultOpts = {
	strict: false,
	filters: [
		filters.sort(),
		filters.filter(),
		filters.select(),
		filters.paginateOffset(),
	],
};

function enumerate(chain, opts) {
	opts = _.defaults({}, opts, defaultOpts);
	chain = common.parseChain(chain);
	var lastLink = chain.pop();
	return middleware;

	function middleware(req, res, next) {
		var resource = lastLink.resource;
		var transaction = common.initTransaction(resource, res);
		_.each(opts.filters, function(filter) { filter(transaction) });
		transaction.notify(resource, 'start', req);
		async.waterfall([
			function(next) {
				common.applyChain(transaction, chain, req, next);
			},
			function(parent, next) {
				var selector = lastLink.selector;
				var filter = common.resolveSelector(selector, req, parent);
				var resview = resource.view(transaction);
				async.parallel({
					data: function(next) {
						resview.findMany(filter, function(err, objects) {
							if (err) return next(err);
							async.map(objects, function(object, next) {
								resview.serialize(object, next);
							}, next);
						});
					},
					count: function(next) {
						resview.model.where(filter).count(next);
					},
				}, next);
			},
		], function(err, results) {
			if (err) return next(err);
			var response = transaction.response;
			response.meta.count = results.count;
			response.links.self = req.originalUrl;
			response.data = results.data;
			transaction.notify(resource, 'end');
			response.send();
			next();
		});
	}
}

module.exports = exports = enumerate;
exports.defaultOptions = defaultOpts;
