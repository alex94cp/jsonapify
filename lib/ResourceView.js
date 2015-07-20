var _ = require('lodash');
var async = require('async');

function ResourceView(resource, fields) {
	var self = this;
	this._resource = resource;
	this._fields = fields;
	this._readableFields = [];
	this._writableFields = [];
	_.each(fields, function(field, name) {
		if (field.readable) self._readableFields.push([name, field]);
		if (field.writable) self._writableFields.push([name, field]);
	});
}

Object.defineProperty(ResourceView.prototype, 'model', {
	get: function() { return this._resource.model; },
});

Object.defineProperty(ResourceView.prototype, 'type', {
	get: function() { return this._resource.type; },
});

ResourceView.prototype.field = function(name) {
	return this._fields[name];
};

ResourceView.prototype.select = function(names) {
	if (!_.isArray(names)) names = [names];
	var selected = {};
	_.each(names, function(name) {
		var field = this.field(name);
		if (field) selected[name] = field;
	});
	return new ResourceView(this._resource, selected);
};

ResourceView.prototype.serialize = function(object, transaction, callback) {
	var resdata = {};
	async.each(this._readableFields, function(nameField, next) {
		var field = nameField[1];
		field.serialize(object, transaction, function(err, value) {
			if (err) return next(err);
			_.set(resdata, nameField[0], value);
			next();
		});
	}, function(err) {
		err ? callback(err) : callback(null, resdata);
	});
};

ResourceView.prototype.deserialize = function(resdata, transaction, object, callback) {
	async.each(this._writableFields, function(nameField, next) {
		var field = nameField[1];
		var value = _.get(resdata, nameField[0]);
		field.deserialize(resdata, transaction, object, next);
	}, function(err) {
		err ? callback(err) : callback(null, object);
	});
};

module.exports = ResourceView;
