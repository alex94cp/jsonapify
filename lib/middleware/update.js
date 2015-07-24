var _ = require('lodash');
var async = require('async');

var common = require('./common');

function update(chain, opts) {
	opts = _.defaults({}, opts, {
		filters: [],
		strict: false,
		noWait: false,
	});
	
	if (opts.filters && !_.isArray(opts.filters))
		opts.filters = [opts.filters];
	
	chain = common.parseChain(chain);
	return middleware;
	
	function middleware(req, res, next) {
		var resource = _.last(chain).resource;
		var transaction = common.initTransaction(resource, res);
		_.each(opts.filters, function(filter) { filter(transaction); });
		transaction.notify(resource, 'start', req);
		common.applyChain(transaction, chain, req, function(err, object) {
			if (err) return next(err);
			var resview = resource.view(transaction);
			resview.deserialize(transaction, req.body.data, object, function(err) {
				if (err) return done(err);
				var response = transaction.response;
				if (opts.noWait) {
					response.raw.statusCode = 202;
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
						response.data = results.data;
						transaction.notify(resource, 'end', response);
						response.send();
						next();
					});
				}
			});
		});
	}
}

module.exports = update;
