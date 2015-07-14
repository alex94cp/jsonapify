var _ = require('lodash');
var util = require('util');
var ApiError = require('./apiError');

function UnknownError(err, opts) {
	ApiError.call(this, _.defaults({}, opts, {
		detail: err.message,
	}));
}

util.inherits(UnknownError, ApiError);
Object.defineProperties(UnknownError.prototype, {
	status: { value: 500 },
	description: { value: 'Unknown Error' },
});

module.exports = UnknownError;
