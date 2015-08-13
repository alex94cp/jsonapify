var _ = require('lodash');
var glob2re = require('glob2re');

var common = require('./common');

function filter() {
	return common.createFilter(queryParser, function(transaction, req, type, param) {
		var filters = parseParam(param);
		transaction.subscribe(type, 'query', function(resview, query) {
			_.each(filters, function(filter, field) {
				resview.accessProperty(field, _.partialRight(filter, query));
			});
		});
	});
}

function queryParser(req, callback) {
	var params = req.query['filter'];
	if (!_.isArray(params)) params = [params];
	_.each(params, function(param) {
		if (_.isPlainObject(param))
			callback(param);
	});
}

function parseParam(param) {
	return _(param).pick(_.isString).mapValues(function(filter) {
		if (isReFilter(filter)) return reFilter(filter);
		if (isEqFilter(filter)) return eqFilter(filter);
		if (isGeFilter(filter)) return geFilter(filter);
		if (isGtFilter(filter)) return gtFilter(filter);
		if (isLeFilter(filter)) return leFilter(filter);
		if (isLtFilter(filter)) return ltFilter(filter);
		if (isNeFilter(filter)) return neFilter(filter);
		return strMatchFilter(filter);
	}).value();
}

function isReFilter(expr) { return _.startsWith(expr, '=~'); }
function isEqFilter(expr) { return _.startsWith(expr, '=='); }
function isNeFilter(expr) { return _.startsWith(expr, '!='); }
function isGeFilter(expr) { return _.startsWith(expr, '>='); }
function isLeFilter(expr) { return _.startsWith(expr, '<='); }
function isGtFilter(expr) { return _.startsWith(expr, '>'); }
function isLtFilter(expr) { return _.startsWith(expr, '<'); }

function eqFilter(filter) {
	var value = filter.slice(2);
	return function(property, query) {
		query.where(property).equals(value);
	};
}

function geFilter(filter) {
	var value = filter.slice(2);
	return function(property, query) {
		query.where(property).gte(value);
	};
}

function gtFilter(filter) {
	var value = filter.slice(1);
	return function(property, query) {
		query.where(property).gt(value);
	};
}

function leFilter(filter) {
	var value = filter.slice(2);
	return function(property, query) {
		query.where(property).lte(value);
	};
}

function ltFilter(filter) {
	var value = filter.slice(1);
	return function(property, query) {
		query.where(property).lt(value);
	};
}

function neFilter(filter) {
	var value = filter.slice(2);
	return function(property, query) {
		query.where(property).ne(value);
	};
}

function reFilter(filter) {
	var beg = filter.indexOf('/', 2);
	var end = filter.lastIndexOf('/');
	var pattern = filter.slice(beg + 1, end);
	var flags = filter.slice(end + 1);
	var re = new RegExp(pattern, flags);
	return function(property, query) {
		var condition = _.set({}, property, re);
		query.where(condition);
	};
}

function strMatchFilter(filter) {
	var re = glob2re(filter);
	return function(property, query) {
		var condition = _.set({}, property, re);
		query.where(condition);
	};
}

module.exports = filter;
