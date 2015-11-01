var _ = require('lodash');

var common = require('./common');

function sort() {
	return common.createFilter(queryParser, function(transaction, req, type, fields) {
		transaction.subscribe(type, 'query', function(resview, query) {
			_.each(fields, function(field) {
				resview.visitProperties(field.name, function(property) {
					var param = _.set({}, property, field.order);
					query.sort(param);
				});
			});
		});
	});
}

function queryParser(req, callback) {
	var params = req.query['sort'];
	if (!_.isArray(params)) params = [params];
	_.each(params, function(param) {
		if (_.isString(param)) {
			callback(parseParam(param));
		} else if (_.isPlainObject(param)) {
			_.each(param, function(param, restype) {
				callback(restype, parseParam(param));
			});
		}
	});
}

function parseParam(param) {
	return _.map(param.split(','), function(string) {
		if (_.startsWith(string, '+')) {
			return { name: string.slice(1), order: 1 };
		} else if (_.startsWith(string, '-')) {
			return { name: string.slice(1), order: -1 };
		} else {
			return { name: string, order: 1 };
		}
	});
}

module.exports = sort;
