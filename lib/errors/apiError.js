var _ = require('lodash');
var util = require('util');

function ApiError(opts) {
	Error.call(this);
	opts = opts || {};
	this._id = opts.id;
	this._meta = opts.meta;
	this._links = opts.links;
	var source = _.pick(opts.source, 'pointer', 'parameter');
	if (!_.isEmpty(source)) this._source = source;
}

util.inherits(ApiError, Error);

ApiError.prototype.toJSON = function() {
	var object = {};
	setIfNotUndefined(object, 'id', this._id);
	setIfNotUndefined(object, 'meta', this._meta);
	setIfNotUndefined(object, 'links', this._links);
	setIfNotUndefined(object, 'status', this.status);
	setIfNotUndefined(object, 'detail', this.detail);
	setIfNotUndefined(object, 'source', this._source);
	setIfNotUndefined(object, 'description', this.description);
	return object;
	
	function setIfNotUndefined(object, path, value) {
		if (!_.isUndefined(value))
			_.set(object, path, value);
	}
};

module.exports = ApiError;
