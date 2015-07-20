var _ = require('lodash');

var Field = require('./Field');
var ResourceView = require('./ResourceView');

function Resource(model, descriptor, opts) {
	if (!descriptor && _.isPlainObject(model)) {
		descriptor = model;
		model = undefined;
	}
	this._model = model;
	this._type = descriptor.type;
	var fields = {};
	extractFieldsInto(this, descriptor.attributes, fields);
	extractFieldsInto(this, descriptor.relationships, fields);
	this._rview = new ResourceView(this, fields);
}

Object.defineProperty(Resource.prototype, 'model', {
	get: function() { return this._model; },
});

Object.defineProperty(Resource.prototype, 'type', {
	get: function() { return this._type; },
});

Resource.prototype.view = function(transaction) {
	return transaction.transform(this, 'view', this._rview);
};

function isFieldDescriptor(object) {
	if (!_isPlainObject(object)) return false;
	if (!_.has(object, 'value')) return false;
	return _.all(object, function(value, key) {
		return ['value','readable','writable','nullable'].includes(key);
	});
}

function extractFieldsInto(self, object, output) {
	return (function iterate(object, scope, output) {
		return _.reduce(object, function(fields, value, key) {
			var newScope = scope.concat(key);
			var name = newScope.join('.');
			if (_.isPlainObject(value) && !_.isEmpty(value)) {
				if (isFieldDescriptor(value)) {
					var opts = _.omit(value, 'value');
					fields[name] = new Field(self, value.value, opts);
				} else {
					iterate(value, newScope, fields);
				}
			} else {
				fields[name] = new Field(self, value);
			}
			return fields;
		}, output);
	})(object, [], output || {});
}

module.exports = Resource;
