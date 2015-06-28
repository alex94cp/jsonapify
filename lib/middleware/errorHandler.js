function errorHandler() {
	return function(err, req, res, next) {
		res.sendStatus(500);
	};
}

module.exports = errorHandler;
