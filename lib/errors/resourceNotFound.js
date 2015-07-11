var util = require('util');
var ApiError = require('./apiError');

function ResourceNotFound(opts) {
	ApiError.call(this, opts);
}

util.inherits(ResourceNotFound, ApiError);
Object.defineProperties(ResourceNotFound.prototype, {
	status: { value: 404 },
	description: { value: 'Resource Not Found' },
});

module.exports = ResourceNotFound;
