var inherits = require('util').inherits;

var Accessor = require('../Accessor');
var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Const(value) {
	this._value = value;
}

inherits(Const, Accessor);

Const.prototype.serialize = function(field, transaction, object, done) {
	done(null, this._value);
};

Const.prototype.deserialize = function(field, transaction, resdata, object, done) {
	if (resdata !== this._value) {
		var opts = { meta: { expected: this._value }};
		var err = new InvalidFieldValue(field, resdata, opts);
		return done(err);
	}
	done(null, object);
};

module.exports = Const;
