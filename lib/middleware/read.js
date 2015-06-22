var _ = require('lodash');

function read(resource, opts) {
	opts = _.defaults(opts || {}, {
		filters: [],
		middleware: [],
	});
	
	if (opts.idParam === undefined)
		throw new Error('idParam not specified in opts');
	
	function useFind(model, req) {
		var id = req.params[opts.idParam];
		return model.findById(id);
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
			res.sendData(wrapped);
			next();
		});
	}
	
	return opts.middleware.length > 0
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = read;
