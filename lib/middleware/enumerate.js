var _ = require('lodash');

function enumerate(resource, opts) {
	opts = _.defaults(opts || {}, {
		filters: [],
	});
	
	if (opts.middleware !== undefined &&
	    !Array.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function useFind(model, req) {
		return model.find();
	}
	
	function queryModel(req) {
		var model = resource.model;
		return opts.filters.reduce(function(acc, f) {
			return f(acc, req);
		}, useFind(model, req));
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
	
	return opts.middleware !== undefined
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = enumerate;
