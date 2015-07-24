var _ = require('lodash');

function sort(opts) {
	opts = _.defaults({}, opts, {
		filterParams: queryParser,
	});
	
	return function(transaction) {
		var restype = transaction.resource.type;
		transaction.subscribe(restype, 'start', function(resource, req) {
			opts.filterParams(req, function(typeName, fields) {
				typeName = typeName || restype;
				transaction.subscribe(typeName, 'view', function(resource, resview) {
					return resview.sort(fields);
				});
			});
		});
	};
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
