var util = require('util');

var ApiError = require('./ApiError');

function ResourceNotFound(resource, anchor, opts) {
	opts = opts || {};
	opts.code = 404;
	opts.detail = 'Resource Not Found';
	ApiError.call(this, opts);
	this._resource = resource;
	this._anchor = anchor;
};

util.inherits(ResourceNotFound, ApiError);

Object.defineProperty(ResourceNotFound.prototype, 'resource', {
	get: function() { return this._resource; },
});

Object.defineProperty(ResourceNotFound.prototype, 'anchor', {
	get: function() { return this._anchor; },
});

module.exports = ResourceNotFound;
