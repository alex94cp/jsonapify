var _ = require('lodash');
var Resource = require('../resource');

function select() {
	return middleware;
	
	function middleware(req, resource) {
		var fields = req.params['fields'];
		if (fields) selectFields(resource, fields.split(','));
		_.each(req.params, function(value, param) {
			var result = param.match(/fields\[([^\]]*)\]/i);
			if (!result) return;
			var typeName = result[1];
			var resource = Resource.byType(typeName);
			if (resource) selectFields(resource, value.split(','));
		});
	}
	
	function selectFields(resource, fields) {
		resource.on('query', function(resview) {
			resview.select(fields);
		});
	}
}

module.exports = select;
