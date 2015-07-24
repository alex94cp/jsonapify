function createFilter(opts, callback) {
	return function(transaction) {
		var restype = transaction.resource.type;
		transaction.subscribe(restype, 'start', function(resource, req) {
			opts.filterParams(req, function(type, params) {
				type = type || restype;
				callback(transaction, type, params);
			});
		});
	};
}

exports.createFilter = createFilter;
