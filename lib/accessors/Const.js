var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Const(value) {
	this._value = value;
}

Const.prototype.accessProperty = function(callback) {
};

Const.prototype.serialize = function(field, transaction, object, callback) {
	callback(null, this._value);
};

Const.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	if (resdata !== this._value) {
		var opts = { meta: { expected: this._value }};
		var err = new InvalidFieldValue(field, resdata, opts);
		return callback(err);
	}
	callback(null, object);
};

module.exports = Const;
