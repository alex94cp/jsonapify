function ConstAccessor(value) {
	if (!(this instanceof ConstAccessor))
		return new ConstAccessor(value);
	
	this._value = value;
}

function createConst(value) {
	return new ConstAccessor(value);
}

ConstAccessor.prototype.get = function(object) {
	return this._value;
};

ConstAccessor.prototype.set = function(object, value) {
	return undefined;
};

module.exports = exports = ConstAccessor;
exports.create = createConst;
