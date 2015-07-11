var util = require('util');
var ApiError = require('./apiError');

function UnknownError(err, opts) {
	ApiError.call(this, opts);
	this._err = err;
}

util.inherits(UnknownError, ApiError);
Object.defineProperties(UnknownError.prototype, {
	status: { value: 500 },
	description: { value: 'Unknown Error' },
	detail: { get: function() { return this._err.message; } },
});

module.exports = UnknownError;
