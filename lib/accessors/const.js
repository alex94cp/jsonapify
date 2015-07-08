var _ = require('lodash');

function Const(value) {
	this._value = value;
}

function createConst(value) {
	return new Const(value);
}

Const.prototype.serialize = function(object, response, cb) {
	_.defer(cb, null, this._value);
};

Const.prototype.deserialize = function(resdata, response, object, cb) {
	if (resdata !== this._value) {
		var err = new Error('invalid resource data');
		_.defer(cb, err);
	} else {
		_.defer(cb, null, object);
	}
};

module.exports = exports = Const;
exports.create = createConst;
