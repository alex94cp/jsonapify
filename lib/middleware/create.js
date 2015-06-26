var _ = require('lodash');

function create(resource, opts) {
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function middleware(req, res, next) {
		var model = resource.model;
		var unwrapped = resource.unwrap(req.body);
		var result = new model(unwrapped);
		result.save(function(err) {
			if (err) return next(err);
			var wrapped = resource.wrap(result);
			var selfLink = wrapped.links.self;
			if (!_.isUndefined(selfLink))
				res.setHeader('Location', selfLink);
			res.setLink('self', req.originalUrl);
			res.status(201).sendData(wrapped);
		});
	}
	
	return !_.isUndefined(opts.middleware)
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = create;
