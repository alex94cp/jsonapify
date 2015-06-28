var _ = require('lodash');

function FieldAccessor(path, opts) {
	if (!(this instanceof FieldAccessor))
		return new FieldAccessor(path);
	
	this._path = path;
	this._readable = opts.readable;
	this._writable = opts.writable;
}

function createField(path, opts) {
	opts = _.defaults(opts || {}, {
		readable: true,
		writable: true
	});
	
	return new FieldAccessor(path, opts);
}

FieldAccessor.prototype.get = function(object) {
	return this._readable ? _.get(object, this._path) : undefined;
}

FieldAccessor.prototype.set = function(object, value) {
	return this._writable ? _.set(object, this._path, value) : undefined;
}

module.exports = exports = FieldAccessor;
exports.create = createField;
