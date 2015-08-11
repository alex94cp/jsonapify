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

exports.createFilter = createFilter;
