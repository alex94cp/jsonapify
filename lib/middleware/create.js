var _ = require('lodash');
var Response = require('../response');

function create(resource, opts) {
	opts = _.defaults({}, opts, {
		noWait: false,
	});
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	function middleware(req, res, next) {
		var response = new Response;
		var object = new resource.model;
		resource.deserialize(req.body.data, response, object, function(err) {
			if (err) return next(err);
			if (opts.noWait) {
				object.save();
				response.data(null);
				res.status(202).json(response);
				return next();
			}
			resource.serialize(object, response, function(err, resdata) {
				if (err) return next(err);
				if (_.has(resdata, 'links.self'))
					res.set('Location', resdata.links.self);
				object.save(function(err) {
					if (err) return next(err);
					response.data(resdata);
					res.status(201).json(response);
					next();
				});
			});
		});
	}
	
	return !_.isUndefined(opts.middleware)
	           ? opts.middleware.concat(middleware)
	           : middleware;
}

module.exports = create;
