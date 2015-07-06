var _ = require('lodash');

function param(field) {
	return function(req, parent) {
		return req.params[field];
	};
}

function query(field) {
	return function(req, parent) {
		return req.query[field];
	};
}

function parent(path) {
	return function(req, parent) {
		return _.get(parent, path);
	};
}

exports.param = param;
exports.query = query;
exports.parent = parent;
