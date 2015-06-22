var _ = require('lodash');

// BUG #1: until mongoose Model#update does proper validation,
//         it's tricky to check whether a full update is being
//         performed

function create(resource, opts) {
	opts = _.defaults(opts || {}, {
		middleware: [],
	});
	
	function searchFilter(req) {
		var filter = {};
		var accessor = resource.key;
		var id = req.params[opts.idParam];
		accessor.set(filter, id);
		return filter;
	}
	
	function assignMiddleware(req, res, next) {
		var model = resource.model;
		var filter = searchFilter(req);
		model.findOne(filter, function(err, result) {
			if (err) return next(err);
			result = result || new model;
			var unwrapped = resource.unwrap(req.body);
			_.assign(result, unwrapped); // [1]
			result.save(function(err) {
				if (err) return next(err);
				var wrapped = resource.wrap(result);
				res.sendData(wrapped);
			});
		});
	}
	
	function createMiddleware(req, res, next) {
		var model = resource.model;
		var unwrapped = resource.unwrap(req.body);
		var result = new model(unwrapped);
		result.save(function(err) {
			if (err) return next(err);
			var wrapped = resource.wrap(result);
			res.sendData(wrapped);
		});
	}
	
	var middleware = opts.idParam !== undefined
	                   ? assignMiddleware
	                   : createMiddleware;
	
	return opts.middleware.length > 0
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = create;
