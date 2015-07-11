var _ = require('lodash');
var common = require('./common');
var errors = require('../errors');
var Response = require('../response');

function errorHandler() {
	return middleware;
	
	function middleware(err, req, res, next) {
		var response = _.get(res, '_jsonapify.response');
		response = response || new Response;
		response.error(new errors.UnknownError(err));
		common.sendResponse(res, response);
	}
}

module.exports = errorHandler;
