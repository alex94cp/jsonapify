var _ = require('lodash');

function read(resource, opts) {
	opts = _.defaults(opts || {}, {
		filters: [],
		idParam: 'id',
		middleware: [],
	});
	
	function useFindOne(model, req) {
		var id = req.params[opts.idParam];
		return model.findById(id);
	}
	
	function queryModel(model, req) {
		return opts.filters.reduce(function(acc, f) {
			return f(acc, req);
		}, useFindOne(model, req));
	}
	
	function middleware(req, res, next) {
		var model = resource.model;
		var query = queryModel(model, req);
		query.exec(function(err, result) {
			if (err) return next(err);
			if (!result) return res.sendStatus(404);
			var data = resource.wrap(result);
			res.sendData(data);
			next();
		});
	}
	
	return opts.middleware.length > 0
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = read;
