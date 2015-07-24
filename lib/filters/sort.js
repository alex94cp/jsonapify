var _ = require('lodash');

var common = require('./common');

function sort(opts) {
	opts = _.defaults({}, opts, {
		filterParams: queryParser,
	});
	
	return common.createFilter(opts, function(transaction, type, params) {
		transaction.subscribe(type, 'view', function(resource, resview) {
			return resview.sort(params);
		});
	});
}

function queryParser(req, callback) {
	var params = req.query['sort'];
	if (!_.isArray(params)) params = [params];
	_.each(params, function(param) {
		if (_.isString(param)) {
			callback('', param.split(','));
		} else if (_.isPlainObject(param)) {
			_.each(param, function(fields, restype) {
				callback(restype, fields.split(','));
			});
		}
	});
}

module.exports = sort;
