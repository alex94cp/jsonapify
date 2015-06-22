var _ = require('lodash');

function FieldAccessor(path, opts) {
	opts = _.defaults(opts || {}, {
		readable: true,
		writable: true
	});
	
	if (!(this instanceof FieldAccessor))
		return new FieldAccessor(path);
	
	this._path = path;
	this._readable = opts.readable;
	this._writable = opts.writable;
}

FieldAccessor.prototype.get = function(object) {
	return this._readable ? _.get(object, this._path) : undefined;
}

FieldAccessor.prototype.set = function(object, value) {
	return this._writable ? _.set(object, this._path, value) : undefined;
}

module.exports = FieldAccessor;
