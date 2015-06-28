var _ = require('lodash');
var errorHandler = require('./errorHandler');

function enumerate(resource, opts) {
	opts = _.defaults(opts || {}, {
		middleware: errorHandler(),
	});
	
	if (!_.isArray(opts.middleware))
		opts.middleware = [opts.middleware];
	
	if (!_.isUndefined(opts.filters) &&
	    !_.isArray(opts.filters))
	    	opts.filters = [opts.filters];
	
	function queryModel(req) {
		var model = resource.model;
		var query = model.find();
		if (_.isUndefined(opts.filters))
			return query;
		return opts.filters.reduce(function(acc, f) {
			return f(acc, req);
		}, query);
	}
	
	function wrapResults(results) {
		return results.map(function(x) {
			return resource.wrap(x);
		});
	}
	
	function middleware(req, res, next) {
		var query = queryModel(req);
		query.exec(function(err, results) {
			if (err) return next(err);
			var wrapped = wrapResults(results);
			res.setLink('self', req.originalUrl);
			res.sendData(wrapped);
		});
	}
	
	return opts.middleware.concat(middleware);
}

module.exports = enumerate;
