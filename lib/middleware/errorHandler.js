var _ = require('lodash');
var errors = require('../errors');
var Response = require('../response');

function errorHandler() {
	return middleware;
	
	function middleware(err, req, res, next) {
		var response = _.get(res, '_jsonapify.response') || new Response(res);
		var unknownError = new errors.UnknownError(err);
		response.error(unknownError).send();
	}
}

module.exports = errorHandler;
