var util = require('util');

var _ = require('lodash');

function ApiError(opts) {
	opts = _.defaults({}, opts, {
		meta: {},
		links: {},
		status: 500,
	});
	this._id = opts.id;
	this._code = opts.code;
	this._meta = opts.meta;
	this._links = opts.links;
	this._title = opts.title;
	this._status = opts.status;
	this._detail = opts.detail;
	this._source = opts.source;
	Error.call(this, opts.detail);
}

util.inherits(ApiError, Error);

Object.defineProperty(ApiError, 'meta', {
	get: function() { return this._meta; },
});

Object.defineProperty(ApiError, 'links', {
	get: function() { return this._links; },
});

Object.defineProperty(ApiError, 'status', {
	get: function() { return this._status; },
});

ApiError.prototype.toJSON = function() {
	var object = {};
	object.id = this._id;
	object.code = this._code;
	object.meta = this._meta;
	object.links = this._links;
	object.title = this._title;
	object.status = this._status;
	object.detail = this._detail;
	object.source = this._source;
	return _.omit(object, _.isEmpty);
};

module.exports = ApiError;
