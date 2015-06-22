function errorHandler() {
	function middleware(err, req, res, next) {
		res.sendError(err);
	}
	
	return middleware;
}

module.exports = errorHandler;
