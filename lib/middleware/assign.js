var _ = require('lodash');
var async = require('async');

var common = require('./common');

function assign(chain, opts) {
	opts = _.defaults({}, opts, {
		strict: false,
		noWait: false,
		filters: common.filters,
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
					object = object || new resource.model(filter);
					next(null, object, resview);
				});
			},
			function(object, resview, next) {
				resview.deserialize(req.body.data, object, function(err, data) {
					err ? next(err) : next(null, data, resview);
				});
			},
		], function(err, object, resview) {
			if (err) return next(err);
			var response = transaction.response;
			if (opts.noWait) {
				response.raw.statusCode = 202;
				transaction.notify(resource, 'end');
				response.send(null);
				object.save(next);
			} else {
				async.parallel({
					save: function(next) {
						object.save(next);
					},
					data: function(next) {
						resview.serialize(object, next);
					},
				}, function(err, results) {
					if (err) return next(err);
					response.data = results.data;
					transaction.notify(resource, 'end');
					response.send();
					next();
				});
			}
		});
	}
}

module.exports = assign;
