var _ = require('lodash');
var async = require('async');

var common = require('./common');
var ResourceNotFound = require('../errors/ResourceNotFound');

function read(chain, opts) {
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
		transaction.notify(resource, 'start', req);
		async.waterfall([
			function(next) {
				common.applyChain(transaction, chain, req, next);
			},
			function(parent, next) {
				var selector = lastLink.selector;
				var filter = common.resolveSelector(selector, req, parent);
				var resview = resource.view(transaction);
				resview.findOne(transaction, filter, function(err, result) {
					if (err) return next(err);
					if (!result) return next(new ResourceNotFound(resource, filter));
					next(null, resview, result);
				});
			},
			function(resview, object, next) {
				resview.serialize(transaction, object, next);
			},
		], function(err, data) {
			if (err) return next(err);
			var response = transaction.response;
			response.links['self'] = req.originalUrl;
			response.data = data;
			transaction.notify(resource, 'end', response);
			response.send();
			next();
		});
	}
}

module.exports = read;
