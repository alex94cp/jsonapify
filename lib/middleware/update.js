var _ = require('lodash');
var async = require('async');

var common = require('./common');

function update(chain, opts) {
	opts = _.defaults({}, opts, {
		strict: false,
		noWait: false,
		filters: null,
	});
	
	chain = common.parseChain(chain);
	return middleware;
	
	function middleware(req, res, next) {
		var resource = _.last(chain).resource;
		var transaction = common.initTransaction(resource, res);
		_.each(opts.filters, function(filter) { filter(transaction) });
		transaction.notify(resource, 'start', req);
		common.applyChain(transaction, chain, req, function(err, object) {
			if (err) return next(err);
			var resview = resource.view(transaction);
			resview.deserialize(req.body.data, object, function(err) {
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
		});
	}
}

module.exports = update;
