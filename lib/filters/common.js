function createFilter(queryParse, callback) {
	return function(transaction) {
		var restype = transaction.resource.type;
		transaction.subscribe(restype, 'start', function(resource, req) {
			queryParse(req, function(type, params) {
				type = type || restype;
				callback(transaction, req, type, params);
			});
		});
	};
}

exports.createFilter = createFilter;
