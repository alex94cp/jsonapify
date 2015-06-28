var _ = require('lodash');
var errorHandler = require('./errorHandler');

function create(resource, opts) {
	opts = _.defaults(opts || {}, {
		middleware: errorHandler(),
	})
	
	if (!_.isArray(opts.middleware))
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
	
	return opts.middleware.concat(middleware);
}

module.exports = create;
