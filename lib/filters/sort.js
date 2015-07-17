var _ = require('lodash');
var Resource = require('../resource');

function sort(opts) {
	return middleware;
	
	function middleware(req, resource) {
		var order = req.query['sort'];
		if (order) sortByFields(resource, order.split(','));
		_.each(req.query, function(value, param) {
			var result = param.match(/sort\[([^\]]*)\]/i);
			if (!result) return;
			var typeName = result[1];
			var resource = Resource.byType(typeName);
			if (resource) sortByFields(resource, value.split(','))
		});
	}
	
	function sortByFields(resource, order) {
		resource.on('view', function(resview) {
			resview.sort(order);
		});
	}
}

module.exports = sort;
