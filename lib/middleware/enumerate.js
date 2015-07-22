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
		async.waterfall([
			function(next) {
				common.applyChain(transaction, chain, req, next);
			},
			function(parent, next) {
				var resview = resource.view(transaction);
				var filter = common.resolveSelector(lastLink.selector);
				async.parallel({
					data: function(next) {
						resview.findMany(transaction, filter, function(err, resources) {
							if (err) return next(err);
							async.map(resources, function(resource, next) {
								resview.serialize(transaction, resource, next);
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
			transaction.transform(resource, 'response', response);
			response.send();
			next();
		});
	}
}

module.exports = enumerate;
