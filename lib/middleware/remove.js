var _ = require('lodash');
var async = require('async');

var common = require('./common');

function remove(chain, opts) {
	opts = _.defaults({}, opts, {
		strict: false,
		filters: common.filters,
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
			var response = transaction.response;
			if (opts.noWait) {
				response.raw.statusCode = 202;
				transaction.notify(resource, 'end');
				response.send(null);
				object.remove(next);
			} else {
				object.remove(function(err) {
					if (err) return next(err);
					response.raw.statusCode = 204;
					transaction.notify(resource, 'end');
					response.send(null);
					next();
				});
			}
		});
	}
}

module.exports = remove;
