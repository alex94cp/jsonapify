var _ = require('lodash');

function delete_(resource, opts) {
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
	
	function middleware(req, res, next) {
		var model = resource.model;
		var filter = searchFilter(req);
		model.remove(function(err, count) {
			if (err) return next(err);
			if (count === 0) return res.sendStatus(404);
			res.setLink('self', req.originalUrl);
			res.sendData();
		});
	}
	
	return !_.isUndefined(opts.middleware)
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = delete_;
