var common = require('./common');
var ApiError = require('../errors/ApiError');
var UnknownError = require('../errors/UnknownError');

function errorHandler() {
	return middleware;
	
	function middleware(err, req, res, next) {
		var transaction = common.initTransaction(null, res);
		var response = transaction.response;
		if (!(err instanceof ApiError))
			err = new UnknownError(err);
		response.error(err);
		response.send();
	}
}

module.exports = errorHandler;
