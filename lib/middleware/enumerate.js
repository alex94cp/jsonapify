var _ = require('lodash');

var util = require('util');

function enumerate(resource, opts) {
	opts = _.defaults(opts || {}, {
		filters: [],
		middleware: [],
	});
	
	function useFind(model, req) {
		return model.find();
	}
	
	function queryModel(model, req) {
		return opts.filters.reduce(function(acc, f) {
			return f(acc, req);
		}, useFind(model, req));
	}
	
	function wrapResults(results) {
		return results.map(function(x) {
			console.log(util.inspect(x));
			var wrapped = resource.wrap(x);
			console.log(util.inspect(wrapped));
			return resource.wrap(x);
		});
	}
	
	function middleware(req, res, next) {
		var model = resource.model;
		var query = queryModel(model, req);
		query.exec(function(err, results) {
			if (err) return next(err);
			var data = wrapResults(results);
			res.sendData(data);
			next();
		});
	}
	
	return opts.middleware.length > 0
	         ? opts.middleware.concat(middleware)
	         : middleware;
}

module.exports = enumerate;
