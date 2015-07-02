var _ = require('lodash');
var Const = require('./accessors/const');

function isValidReadAccessor(object) {
	return _.isFunction(object.serialize);
}

function isValidWriteAccessor(object) {
	return _.isFunction(object.deserialize);
}

function isValidAccessor(object) {
	return isValidReadAccessor(object) &&
	       isValidWriteAccessor(object);
}

function createAccessor(object) {
	return (_.isUndefined(object) || !isValidAccessor(object))
	           ? new Const(object)
	           : object;
}

exports.create = createAccessor;
exports.isValid = isValidAccessor;
exports.isValidRead = isValidReadAccessor;
exports.isValidWrite = isValidWriteAccessor;
