var _ = require('lodash');

function read(resource, opts) {
	opts = _.defaults(opts || {}, {
		filters: [],
		idParam: 'id',
	});
	
	if (!_.isUndefined(opts.filters) &&
	    !_.isArray(opts.filters))
	    	opts.filters = [opts.filters];
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function searchFilter(req) {
		var filter = {};
		var accessor = resource.id;
		var id = req.params[opts.idParam];
		accessor.set(filter, id);
		return filter;
	}
	
	function queryModel(req) {
		var model = resource.model;
		var filter = searchFilter(req);
		var query = model.findOne(filter);
		if (_.isUndefined(opts.filters))
			return query;
		return opts.filters.reduce(function(acc, f) {
			return f(acc, req);
		}, query);
	}
	
	function middleware(req, res, next) {
		var query = queryModel(req);
		query.exec(function(err, result) {
			if (err) return next(err);
			if (!result) return res.sendStatus(404);
			var wrapped = resource.wrap(result);
			res.setLink('self', req.originalUrl);
			res.sendData(wrapped);
		});
	}
	
	return !_.isUndefined(opts.middleware)
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = read;
