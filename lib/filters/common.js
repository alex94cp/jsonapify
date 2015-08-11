var url = require('url');

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

function modifyQuery(uri, name, query) {
	var info = url.parse(uri);
	info.search = undefined;
	_.assign(info.query, query);
	return url.format(info);
}

exports.createFilter = createFilter;
exports.modifyQuery = modifyQuery;
