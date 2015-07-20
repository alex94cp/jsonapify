var _ = require('lodash');

var errors = require('./errors');
var Const = require('./accessors/Const');
var InvalidFieldValue = errors.InvalidFieldValue;

function Field(resource, name, value, opts) {
	opts = _.defaults({}, opts, {
		readable: true,
		writable: true,
		nullable: false,
	});
	this._resource = resource;
	this._name = name;
	this._accessor = toAccessor(value);
	this._readable = opts.readable;
	this._writable = opts.writable;
	this._nullable = opts.nullable;
}

Object.defineProperty(Field.prototype, 'resource', {
	get: function() { return this._resource; },
});

Object.defineProperty(Field.prototype, 'name', {
	get: function() { return this._name; },
});

Object.defineProperty(Field.prototype, 'readable', {
	get: function() { return this._readable; },
});

Object.defineProperty(Field.prototype, 'writable', {
	get: function() { return this._writable; },
});

Object.defineProperty(Field.prototype, 'nullable', {
	get: function() { return this._nullable; },
});

Field.prototype.serialize = function(transaction, object, callback) {
	var self = this;
	if (!this._readable) return callback(null);
	this._accessor.serialize(this, transaction, object, function(err, value) {
		if (err) return callback(err);
		if (_.isUndefined(value) && !this._nullable)
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
	return isFieldAccessor(object) ? object : new Const(object);
}

function isFieldAccessor(object) {
	return object && object.serialize && object.deserialize;
}

module.exports = Field;
