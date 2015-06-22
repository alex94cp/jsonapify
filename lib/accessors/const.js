function ConstAccessor(value) {
	if (!(this instanceof ConstAccessor))
		return new ConstAccessor(value);
	
	this._value = value;
}

ConstAccessor.prototype.get = function(object) { return this._value; };
ConstAccessor.prototype.set = function(object) { return undefined; };
module.exports = ConstAccessor;
