var _ = require('lodash');
var async = require('async');

function Field(name, value, opts) {
	opts = _.defaults({}, opts, {
		readable: true,
		writable: true,
		nullable: false,
	});
	
	this._name = name;
	this._value = value;
	this._readable = opts.readable;
	this._writable = opts.writable;
	this._nullable = opts.nullable;
}

Object.defineProperty(Field.prototype, 'name', {
	get: function() { return this._name; }
});

Object.defineProperty(Field.prototype, 'readable', {
	get: function() { return this._readable; }
});

Object.defineProperty(Field.prototype, 'writable', {
	get: function() { return this._writable; }
});

Object.defineProperty(Field.prototype, 'nullable', {
	get: function() { return this._nullable }
});

Field.prototype.adjustQuery = function(action, query) {
	var value = this._value;
	if (!value.adjustQuery) return false;
	return value.adjustQuery.apply(value, arguments);
};

function isValidAccessor(object) {
	return object.serialize && object.deserialize;
}

Field.prototype.serialize = function(object, response, cb) {
	if (!this._readable)
		return _.defer(cb, null);
	if (isValidAccessor(this._value)) {
		var self = this;
		this._value.serialize(object, response, function(err, value) {
			if (err) return cb(err);
			if (_.isUndefined(value) && !self._nullable) {
				var err = new Error('missing required field');
				return cb(err);
			}
			cb(null, value);
		});
	} else {
		_.defer(cb, null, this._value);
	}
};

Field.prototype.deserialize = function(resdata, response, output, cb) {
	if (!this._writable)
		return _.defer(cb, null, output);
	if (_.isUndefined(resdata) && !this._nullable) {
		var err = new Error('missing required field');
		return _.defer(cb, err);
	}
	if (isValidAccessor(this._value)) {
		this._value.deserialize(resdata, response, output, cb);
	} else {
		if (resdata !== this._value) {
			var err = new Error('invalid field value');
			return _.defer(cb, err);
		}
		_.defer(cb, null, output);
	}
};

module.exports = exports = Field;
