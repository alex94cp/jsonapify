var _ = require('lodash');
var async = require('async');
var errors = require('../errors');
var mongoose = require('mongoose');
var Negotiator = require('negotiator');
var contentType = require('content-type');

var FULL_CHAIN = 0;
var PARTIAL_CHAIN = 1;
var MIXED_CHAIN = 2;

function extractOpts(args, chainType) {
	if (chainType === MIXED_CHAIN) {
		chainType = args.length <= 2
		              ? PARTIAL_CHAIN
		              : FULL_CHAIN;
	}
	if (args.length % 2 !== chainType)
		return args.pop();
}

function checkRequest(req) {
	var vndApiJson = 'application/vnd.api+json';
	return contentTypeErrors() || acceptErrors();
	
	function contentTypeErrors() {
		try {
			var reqContentType = contentType.parse(req);
			if (reqContentType.type !== vndApiJson ||
			    !_.isEmpty(reqContentType.parameters))
			    	return new errors.HttpError(415);
			return null;
		} catch (err) {
			return new errors.HttpError(415);
		}
	}
	
	function acceptErrors() {
		var negotiator = new Negotiator(req);
		if (negotiator.mediaType([vndApiJson]) !== vndApiJson)
			return new errors.HttpError(406);
		return null;
	}
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
	selector = selector || {};
	return _.isFunction(selector)
	           ? { _id: selector(req, parent) }
	           : resolveSelectorIter(selector);
	
	function resolveSelectorIter(selector) {
		return _(selector).pairs().map(function(pair) {
			var first = pair[0]; var second = pair[1];
			if (_.isFunction(second))
				return [first, second(req, parent)];
			if (_.isPlainObject(second))
				return [first, resolveSelectorIter(second)];
		}).zipObject().value();
	}
}

exports.FULL_CHAIN = FULL_CHAIN;
exports.MIXED_CHAIN = MIXED_CHAIN;
exports.PARTIAL_CHAIN = PARTIAL_CHAIN;

exports.extractOpts = extractOpts;
exports.wrapResults = wrapResults;
exports.checkRequest = checkRequest;
exports.applySelectors = applySelectors;
exports.resolveSelector = resolveSelector;
