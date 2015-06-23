var _ = require('lodash');

function update(resource, opts) {
	opts = _.defaults(opts || {}, {
		idParam: 'id',
	});
	
	if (opts.middleware !== undefined &&
	    !Array.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function searchFilter(req) {
		var filter = {};
		var accessor = resource.key;
		var id = req.params[opts.idParam];
		accessor.set(filter, id);
		return filter;
	}
	
	function middleware(req, res, next) {
		var model = resource.model;
		var filter = searchFilter(req);
		model.findOne(filter, function(err, result) {
			if (err) return next(err);
			if (!result) return res.sendStatus(404);
			var unwrapped = resource.unwrap(req.body);
			_.assign(result, unwrapped);
			result.save(function(err) {
				if (err) return next(err);
				var wrapped = resource.wrap(result);
				res.setLink('self', req.originalUrl);
				res.sendData(wrapped);
			});
		});
	}
	
	return opts.middleware !== undefined
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = update;
