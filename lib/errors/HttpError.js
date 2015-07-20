var util = require('util');
var http = require('http');

var _ = require('lodash');

var ApiError = require('./ApiError');

function HttpError(status, opts) {
	opts = opts || {};
	opts.status = status;
	opts.detail = http.STATUS_CODES[status];
	ApiError.call(this, opts);
}

util.inherits(HttpError, ApiError);

module.exports = HttpError;
