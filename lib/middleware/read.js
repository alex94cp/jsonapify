var _ = require('lodash');
var Response = require('../response');

function read(resource, opts) {
	opts = _.defaults({}, opts, {
		idParam: 'id',
	});
	
	if (!_.isUndefined(opts.middleware) &&
	    !_.isArray(opts.middleware))
	    	opts.middleware = [opts.middleware];
	
	if (!_.isUndefined(opts.filters) &&
	    !_.isArray(opts.filters))
	    	opts.filters = [opts.filters];
	
	function searchFilter(req, response, cb) {
		var filter = {};
		var id = req.params[opts.idParam];
		resource.id.deserialize(id, response, filter, function(err) {
			err ? cb(err) : cb(null, filter);
		});
	}
	
	function initQuery(req, response, cb) {
		searchFilter(req, response, function(err, filter) {
			if (err) return cb(err);
			var query = resource.model.findOne(filter);
			cb(null, query);
		});
	}
	
	function queryModel(req, response, cb) {
		initQuery(req, response, function(err, query) {
			if (err) return cb(err);
			if (!_.isUndefined(opts.filters)) {
				query = opts.filters.reduce(function(acc, f) {
					return f(acc, req, response);
				}, query);
			}
			query.exec(cb);
		});
	}
	
	function wrapResult(result, response, cb) {
		result ? resource.serialize(result, response, cb)
		       : _.defer(cb, null, null);
	}
	
	function middleware(req, res, next) {
		var response = new Response;
		response.link('self', req.originalUrl);
		queryModel(req, response, function(err, result) {
			if (err) return next(err);
			wrapResult(result, response, function(err, resdata) {
				if (err) return next(err);
				if (!resdata) res.status(404);
				response.data(resdata);
				res.json(response);
				next();
			});
		});
	}
	
	return !_.isUndefined(opts.middleware)
	           ? opts.middleware.concat(middleware)
	           : middleware;
}

module.exports = read;
