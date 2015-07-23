var util = require('util');

var ApiError = require('./ApiError');

function InvalidFieldValue(field, value, opts) {
	opts = opts || {};
	opts.status = 422;
	opts.detail = 'Invalid Field Value';
	ApiError.call(this, opts);
	this._field = field;
	this._value = value;
}

util.inherits(InvalidFieldValue, ApiError);

Object.defineProperty(InvalidFieldValue.prototype, 'field', {
	get: function() { return this._field; },
});

Object.defineProperty(InvalidFieldValue.prototype, 'value', {
	get: function() { return this._value; },
});

module.exports = InvalidFieldValue;
