var _ = require('lodash');

function ApiError(opts) {
	opts = opts || {};
	this._id = opts.id;
	this._meta = opts.meta;
	this._links = opts.links;
	var source = _.pick(opts.source, 'pointer', 'parameter');
	if (!_.isEmpty(source)) this._source = source;
}

function setIfNotUndefined(object, path, value) {
	if (!_.isUndefined(value))
		_.set(object, path, value);
}

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
};

module.exports = ApiError;
