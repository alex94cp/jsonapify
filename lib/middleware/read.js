var _ = require('lodash');

function read(resource, opts) {
	opts = _.defaults(opts || {}, {
		filters: [],
		idParam: 'id',
	});
	
	if (opts.middleware !== undefined &&
	    !Array.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function searchFilter(req) {
		var filter = {};
		var accessor = resource.id;
		var id = req.params[opts.idParam];
		accessor.set(filter, id);
		return filter;
	}
	
	function useFind(model, req) {
		var filter = searchFilter(req);
		return model.findOne(filter);
	}
	
	function queryModel(req) {
		var model = resource.model;
		return opts.filters.reduce(function(acc, f) {
			return f(acc, req);
		}, useFind(model, req));
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
	
	return opts.middleware !== undefined
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = read;
