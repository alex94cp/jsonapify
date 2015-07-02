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
	_.defer(cb);
};

module.exports = exports = Const;
exports.create = createConst;
