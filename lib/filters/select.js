var _ = require('lodash');

var common = require('./common');

function select() {
	return common.createFilter(queryParser, function(transaction, req, type, fields) {
		transaction.subscribe(type, 'view', function(resource, resview) {
			fields = ['type', 'id'].concat(fields);
			return resview.select(fields);
		});
	});
}

function queryParser(req, callback) {
	var params = req.query['fields'];
	if (!_.isArray(params)) params = [params];
	_.each(params, function(param) {
		if (_.isString(param)) {
			callback(param.split(','));
		} else if (_.isPlainObject(param)) {
			_.each(param, function(fields, restype) {
				callback(restype, fields.split(','));
			});
		}
	});
}

module.exports = select;
