var _ = require('lodash');
var async = require('async');

var common = require('./common');

function enumerate(chain, opts) {
	opts = _.defaults({}, opts, {
		filters: [],
		strict: false,
	});
	
	if (opts.filters && !_.isArray(opts.filters))
		opts.filters = [opts.filters];
	
	chain = common.parseChain(chain);
	var lastLink = chain.pop();
	return middleware;
	
	function middleware(req, res, next) {
		var resource = lastLink.resource;
		var transaction = common.initTransaction(resource, res);
		_.each(opts.filters, function(filter) { filter(transaction); });
		transaction.notify(resource, 'request', req);
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
						resview.findMany(transaction, filter, function(err, results) {
							if (err) return next(err);
							async.map(results, function(object, next) {
								resview.serialize(transaction, object, next);
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
			response.meta['count'] = results.count;
			response.links['self'] = req.originalUrl;
			response.data = results.data;
			transaction.notify(resource, 'response', response);
			response.send();
			next();
		});
	}
}

module.exports = enumerate;
