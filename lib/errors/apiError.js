var _ = require('lodash');
var util = require('util');

function ApiError(opts) {
	opts = opts || {};
	Error.call(this);
	this._id = opts.id;
	this._meta = opts.meta;
	this._links = opts.links;
	this._detail = opts.detail;
	this._source = opts.source || {};
}

util.inherits(ApiError, Error);

ApiError.prototype.toJSON = function() {
	var object = {};
	setIfNotUndefined(object, 'id', this._id);
	setIfNotUndefined(object, 'meta', this._meta);
	setIfNotUndefined(object, 'links', this._links);
	setIfNotUndefined(object, 'status', this.status);
	setIfNotUndefined(object, 'detail', this._detail);
	setIfNotUndefined(object, 'description', this.description);
	setIfNotUndefined(object, 'source.pointer', this._source.pointer);
	setIfNotUndefined(object, 'source.parameter', this._source.parameter);
	return object;
	
	function setIfNotUndefined(object, path, value) {
		if (!_.isUndefined(value))
			_.set(object, path, value);
	}
};

module.exports = ApiError;
