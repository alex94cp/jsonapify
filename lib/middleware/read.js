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
				var resview = resource.view(transaction);
				var filter = common.resolveSelector(selector, req, parent);
				resview.findOne(filter, function(err, object) {
					if (err) return next(err);
					if (!object) return next(new ResourceNotFound(resource, filter));
					next(null, object, resview);
				});
			},
			function(object, resview, next) {
				resview.serialize(object, next);
			},
		], function(err, data) {
			if (err) return next(err);
			var response = transaction.response;
			response.links['self'] = req.originalUrl;
			response.data = data;
			transaction.notify(resource, 'end');
			response.send();
			next();
		});
	}
}

module.exports = read;
