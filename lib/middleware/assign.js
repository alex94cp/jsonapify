var _ = require('lodash');
var errorHandler = require('./errorHandler');

function assign(resource, opts) {
	opts = _.defaults(opts || {}, {
		idParam: 'id',
		middleware: errorHandler(),
	});
	
	if (!_.isArray(opts.middleware))
		opts.middleware = [opts.middleware];
	
	function searchFilter(req) {
		var filter = {};
		var accessor = resource.id;
		var id = req.params[opts.idParam];
		accessor.set(filter, id);
		return filter;
	}
	
	function middleware(req, res, next) {
		var model = resource.model;
		var filter = searchFilter(req);
		model.findOne(filter, function(err, result) {
			if (err) return next(err);
			var unwrapped = resource.unwrap(req.body);
			if (result)
				_.assign(result, unwrapped);
			else
				result = new model(unwrapped);
			result.save(function(err) {
				if (err) return next(err);
				res.setLink('self', req.originalUrl);
				res.status(201).sendData();
			});
		});
	}
	
	return opts.middleware.concat(middleware);
}

module.exports = assign;
