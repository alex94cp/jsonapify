var _ = require('lodash');
var async = require('async');
var jsonpatch = require('jsonpatch');

var common = require('./common');

function modify(chain, opts) {
	opts = _.defaults({}, opts, {
		strict: false,
		filters: null,
	});
	
	chain = common.parseChain(chain);
	return middleware;
	
	function middleware(req, res, next) {
		var resource = _.last(chain).resource;
		var transaction = common.initTransaction(resource, res);
		_.each(opts.filters, function(filter) { filter(transaction) });
		transaction.notify(resource, 'start', req);
		async.waterfall([
			function(next) {
				common.applyChain(transaction, chain, req, next);
			},
			function(object, next) {
				var resview = resource.view(transaction);
				resview.serialize(object, function(err, data) {
					err ? next(err) : next(null, data, resview, object);
				});
			},
			function(data, resview, object, next) {
				try {
					var result = jsonpatch.apply_patch(data, req.body.data);
					resview.deserialize(result, object, function(err) {
						err ? next(err) : next(null, object, result);
					});
				} catch (err) { return next(err) }
			},
			function(object, result, next) {
				object.save(function(err) {
					err ? next(err) : next(null, result);
				});
			},
		], function(err, resdata) {
			if (err) return next(err);
			var response = transaction.response;
			response.data = resdata;
			transaction.notify(resource, 'end');
			response.send();
			next();
		});
	}
}

module.exports = modify;