var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Negotiator = require('negotiator');
var contentType = require('content-type');

function isSelector(object) {
	if (_.isFunction(object))
		return true;
	if (_.isPlainObject(object))
		return _.any(object, isSelector);
}

function isOptions(object) {
	return _.isPlainObject(object) && !isSelector(object);
}

function wrapResults(resource, object, response, cb) {
	if (_.isArray(object)) {
		async.map(object, function(object, cb) {
			resource.serialize(object, response, cb);
		}, cb);
	} else {
		object ? resource.serialize(object, response, cb)
		       : _.defer(cb, null, null);
	}
}

function forwardError(err, res, response, next) {
	_.set(res, '_jsonapify.response', response);
	next(err);
}

function sendResponse(res, response) {
	function genericErrorCode(code) {
		return Math.ceil(code / 100) * 100;
	}
	
	function aproximateErrorCode(codes) {
		var status = _.first(codes);
		if (codes.length > 1)
			status = genericErrorCode(status);
		return status;
	}
	
	function handleErrors(res, errors) {
		if (_.isEmpty(errors)) return;
		var codes = _.pluck(errors, 'status');
		var errCode = aproximateErrorCode(codes);
		res.status(errCode);
	}
	
	res.contentType('application/vnd.api+json');
	var contents = JSON.stringify(response);
	handleErrors(res, response.errors());
	res.send(contents);
}

function applySelectors(pairs, req, cb) {
	async.reduce(pairs, undefined, function(parent, pair, cb) {
		var resource = pair[0]; var selector = pair[1];
		var filter = resolveSelector(selector, req, parent);
		resource.model.findOne(filter, function(err, result) {
			if (err) return cb(err);
			if (!result) return cb('break', null);
			cb(null, result);
		});
	}, function(err, result) {
		(err && err !== 'break') ? cb(err) : cb(null, result);
	});
}

function resolveSelector(selector, req, parent) {
	function resolveSelectorIter(selector) {
		return _(selector).pairs().map(function(pair) {
			var first = pair[0]; var second = pair[1];
			if (_.isFunction(second))
				return [first, second(req, parent)];
			if (_.isPlainObject(second))
				return [first, resolveSelectorIter(second)];
		}).zipObject().value();
	}
	
	selector = selector || {};
	return _.isFunction(selector)
	           ? { _id: selector(req, parent) }
	           : resolveSelectorIter(selector);
}

exports.isOptions = isOptions;
exports.isSelector = isSelector;
exports.wrapResults = wrapResults;
exports.forwardError = forwardError;
exports.sendResponse = sendResponse;
exports.applySelectors = applySelectors;
exports.resolveSelector = resolveSelector;
