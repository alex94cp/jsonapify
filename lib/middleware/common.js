var _ = require('lodash');
var async = require('async');

function isSelector(object) {
	if (_.isFunction(object))
		return true;
	if (_.isPlainObject(object))
		return _.any(object, isSelector);
}

function isOptions(object) {
	return _.isPlainObject(object) && !isSelector(object);
}

function resolveSelector(selector, req, parent) {
	function resolveSelectorIter(selector) {
		return _(selector).pairs().map(function(pair) {
			var first = pair[0];
			var second = pair[1];
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
	async.reduce(pairs, null, function(parent, pair, cb) {
		var resource = pair[0];
		var selector = pair[1];
		var filter = resolveSelector(selector, req, parent);
		resource.model.findOne(filter, cb);
	}, cb);
}

exports.isOptions = isOptions;
exports.isSelector = isSelector;
exports.resolveSelector = resolveSelector;
exports.applySelectors = applySelectors;
exports.wrapResults = wrapResults;
