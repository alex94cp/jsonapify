var _ = require('lodash');

var Accessor = require('./Accessor');
var Const = require('./accessors/Const');
var InvalidFieldValue = require('./errors/InvalidFieldValue');

function Field(resource, name, value, opts) {
	opts = _.defaults({}, opts, {
		readable: true,
		writable: true,
		nullable: false,
	});
	this._name = name;
	this._resource = resource;
	this._accessor = toAccessor(value);
	this._readable = opts.readable;
	this._writable = opts.writable;
	this._nullable = opts.nullable;
}

Object.defineProperties(Field.prototype, {
	name: { get: function() { return this._name }},
	resource: { get: function() { return this._resource }},
	readable: { get: function() { return this._readable }},
	writable: { get: function() { return this._writable }},
	nullable: { get: function() { return this._nullable }},
});

Field.prototype.accessProperty = function(callback) {
	this._accessor.accessProperty(callback);
};

Field.prototype.serialize = function(transaction, object, callback) {
	var self = this;
	if (!this._readable) return callback(null);
	this._accessor.serialize(this, transaction, object, function(err, value) {
		if (err) return callback(err);
		if (_.isUndefined(value) && !self._nullable)
			return callback(new InvalidFieldValue(self, undefined));
		return callback(null, value);
	});
};

Field.prototype.deserialize = function(transaction, resdata, object, callback) {
	if (!this._writable) return callback(null, object);
	if (_.isUndefined(resdata) && !this._nullable)
		return callback(new InvalidFieldValue(this, undefined));
	this._accessor.deserialize(this, transaction, resdata, object, callback);
};

function toAccessor(object) {
	return (object instanceof Accessor) ? object : new Const(object);
}

module.exports = Field;
