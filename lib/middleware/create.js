var _ = require('lodash');
var async = require('async');

var common = require('./common');

function create(chain, opts) {
	opts = _.defaults({}, opts, {
		filters: [],
		strict: false,
		noWait: false,
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
				var object = new resource.model(filter);
				var resview = resource.view(transaction);
				resview.deserialize(transaction, req.body.data, object, function(err) {
					err ? next(err) : next(null, object, resview);
				});
			},
		], function(err, object, resview) {
			if (err) return next(err);
			var response = transaction.response;
			response.links['self'] = req.originalUrl;
			if (opts.noWait) {
				response.raw.statusCode = 202;
				transaction.notify(resource, 'end', response);
				response.send(null);
				object.save(next);
			} else {
				async.parallel({
					save: function(next) {
						object.save(next);
					},
					data: function(next) {
						resview.serialize(transaction, object, next);
					},
				}, function(err, results) {
					if (err) return next(err);
					var data = results.data;
					response.data = data;
					response.raw.statusCode = 201;
					var location = _.get(data, 'links.self');
					if (location) response.raw.set('Location', location);
					transaction.notify(resource, 'end', response);
					response.send();
					next();
				});
			}
		});
	}
}

module.exports = create;
