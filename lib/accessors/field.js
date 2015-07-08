var _ = require('lodash');

function Field(path, opts) {
	opts = _.defaults({}, opts, {
		readable: true,
		writable: true,
	});
	
	this._path = path;
	this._readable = opts.readable;
	this._writable = opts.writable;
}

function createField(path, opts) {
	return new Field(path, opts);
}

Field.prototype.serialize = function(object, response, cb) {
	if (!this._readable)
		return _.defer(cb, null);
	_.defer(cb, null, _.get(object, this._path));
};

Field.prototype.deserialize = function(resdata, response, object, cb) {
	if (!this._writable)
		return _.defer(cb, new Error('resource field is not writable'));
	_.set(object, this._path, resdata);
	_.defer(cb, null, object);
};

module.exports = exports = Field;
exports.create = createField;
