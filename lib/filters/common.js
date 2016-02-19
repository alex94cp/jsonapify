var url = require('url');
var qs = require('qs');

var _ = require('lodash');

function createFilter(queryParse, handler) {
	return function(transaction) {
		var restype = transaction.resource.type;
		transaction.subscribe(restype, 'start', function(resource, req) {
			queryParse(req, function(type, params) {
				if (_.isUndefined(params)) {
					params = type;
					type = restype;
				}
				handler(transaction, req, type, params);
			});
		});
	};
}

function modifyQuery(uri, query) {
	var info = url.parse(uri);
	var queryObj = qs.parse(info.query);
	queryObj = _.merge(queryObj, query);
	info.search = '?' + qs.stringify(queryObj, { encode: false });
	return url.format(info);
}

exports.createFilter = createFilter;
exports.modifyQuery = modifyQuery;
