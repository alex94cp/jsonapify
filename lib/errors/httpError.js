var _ = require('lodash');
var util = require('util');
var http = require('http');
var ApiError = require('./apiError');

function HttpError(status, detail, opts) {
	if (_.isPlainObject(detail) && _.isUndefined(opts)) {
		opts = detail;
		detail = undefined;
	}
	
	ApiError.call(this, opts);
	this._status = status;
	this._detail = opts.detail;
}

util.inherits(HttpError, ApiError);
Object.defineProperties(HttpError.prototype, {
	status: { get: function() { return this._status; } },
	detail: { get: function() { return this._detail; } },
	description: { get: function() { return http.STATUS_CODES[this._status]; } },
});

module.exports = HttpError;
