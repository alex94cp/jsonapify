var _ = require('lodash');
var errors = require('../errors');
var Response = require('../response');

function errorHandler() {
	return middleware;
	
	function middleware(err, req, res, next) {
		var response = res.response || new Response(res);
		if (!(err instanceof errors.ApiError))
			err = new errors.UnknownError(err);
		response.error(err).send();
	}
}

module.exports = errorHandler;
