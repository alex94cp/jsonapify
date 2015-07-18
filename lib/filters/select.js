var _ = require('lodash');
var Resource = require('../resource');

function Select() {
	this._handlers = [];
}

function createSelect() {
	return new Select;
}

Select.prototype.initialize = function(resource, req, response) {
	var fields = req.query['fields'];
	if (fields) this._eachParam(resource, fields.split(','));
	_.each(req.query, function(value, param) {
		var result = param.match(/fields\[([^\]]*)\]/i);
		if (!result) return;
		var typeName = result[1];
		var resource = Resource.byType(typeName);
		if (resource) this._eachParam(resource, value.split(','));
	});
};

Select.prototype._eachParam = function(resource, fields) {
	var handler = function(resview) { resview.select(fields); };
	resource.addListener('view', handler);
	this._handlers.push({ resource: resource, handler: handler });
};

Select.prototype.remove = function() {
	_.each(this._handlers, function(info) {
		var handler = info.handler;
		var resource = info.resource;
		resource.removeListener('view', handler);
	});
};

Select.prototype._eachResource = function(resource, fields) {
	resource.on('view', function(resview) {
		resview.select(fields);
	});
};

module.exports = exports = Select;
exports.create = createSelect;
