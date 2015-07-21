var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Const(value) {
	this._value = value;
}

Const.prototype.adjustQuery = function(query, action) {
	return false;
};

Const.prototype.serialize = function(field, transaction, object, callback) {
	callback(null, this._value);
};

Const.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	if (resdata !== this._value)
		return callback(new InvalidFieldValue(field, resdata));
	callback(null, object);
};

module.exports = Const;
