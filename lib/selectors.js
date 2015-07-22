var _ = require('lodash');

function query(name) {
	return function(req, parent) {
		return req.query[name];
	};
}

function param(name) {
	return function(req, parent) {
		return req.param[name];
	};
}

function parent(name) {
	return function(req, parent) {
		return _.get(parent, name);
	};
}

exports.query = query;
exports.param = param;
exports.parent = parent;
