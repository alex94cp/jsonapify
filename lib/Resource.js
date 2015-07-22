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
	var fields = extractFields(this, descriptor);
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

function extractFields(self, object, fields) {
	return (function iterate(object, scope, fields) {
		_.each(object, function(value, key) {
			var newScope = scope.concat(key);
			var name = newScope.join('.');
			if (_.isPlainObject(value) && !_.isEmpty(value)) {
				if (isAccessor(value)) {
					var field = new Field(self, name, value);
					fields.push(field);
				} else if (isFieldDescriptor(value)) {
					var opts = _.omit(value, 'value');
					var field = new Field(self, name, value.value, opts);
					fields.push(field);
				} else {
					iterate(value, newScope, fields);
				}
			} else {
				var field = new Field(self, name, value);
				fields.push(field);
			}
		});
		return fields;
	})(object, [], fields || []);
}

function isFieldDescriptor(object) {
	if (!_.isPlainObject(object)) return false;
	if (!_.has(object, 'value')) return false;
	return _.all(object, function(value, key) {
		return ['value','readable','writable','nullable'].includes(key);
	});
}

function isAccessor(object) {
	return object && object.serialize && object.deserialize;
}

module.exports = Resource;
