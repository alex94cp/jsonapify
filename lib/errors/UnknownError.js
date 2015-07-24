var util = require('util');

var ApiError = require('./ApiError');

function UnknownError(err, opts) {
	opts = opts || {};
	opts.status = 500;
	opts.detail = err.message;
	ApiError.call(this, opts);
}

util.inherits(UnknownError, ApiError);

module.exports = UnknownError;
