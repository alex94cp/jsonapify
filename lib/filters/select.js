var _ = require('lodash');
var Resource = require('../resource');

function Selector() {
	this._handlers = [];
}

function createSelector() {
	return new Selector;
}

Selector.prototype.initialize = function(resource, req) {
	var fields = req.query['fields'];
	if (fields) this._eachParam(resource, fields);
	_.each(req.query, function(value, param) {
		var result = param.match(/fields\[([^\]]*)\]/i);
		if (!result) return;
		var typeName = result[1];
		var resource = Resource.byType(typeName);
		if (resource) this._eachParam(resource, value);
	});
};

Selector.prototype._eachParam = function(resource, fields) {
	fields = fields.split(',');
	var handler = function(resview) {
		resview.select(fields);
	};
	resource.addListener('view', handler);
	this._handlers.push({ resource: resource, handler: handler });
};

Selector.prototype.addResponseInfo = function(response) {};

Selector.prototype.remove = function() {
	_.each(this._handlers, function(info) {
		info.resource.removeListener('view', info.handler);
	});
	this._handlers = [];
};

module.exports = exports = Selector;
exports.create = createSelector;
