var _ = require('lodash');

function FieldAccessor(path) {
	if (!(this instanceof FieldAccessor))
		return new FieldAccessor(path);
	this._path = path;
}

FieldAccessor.prototype.get = function(object) {
	return _.get(object, this._path);
}

FieldAccessor.prototype.set = function(object, value) {
	return _.set(object, this._path, value);
}

module.exports = FieldAccessor;
