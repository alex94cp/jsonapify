var _ = require('lodash');

var common = require('./common');

function sort() {
	return common.createFilter(queryParser, function(transaction, req, type, fields) {
		transaction.subscribe(type, 'query', function(resview, query) {
			_.each(fields, function(field) {
				var sort = parseSortField(field);
				resview.accessProperty(sort.name, function(property) {
					var param = _.set({}, property, sort.order);
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
			callback(param.split(','));
		} else if (_.isPlainObject(param)) {
			_.each(param, function(fields, restype) {
				callback(restype, fields.split(','));
			});
		}
	});
}

function parseSortField(sortName) {
	var field = null, order = 1;
	if (_.startsWith(sortName, '+')) {
		field = sortName.slice(1);
	} else if (_.startsWith(sortName, '-')) {
		order = -1;
		field = sortName.slice(1);
	} else {
		field = sortName;
	}
	return { name: field, order: order };
}

module.exports = sort;
