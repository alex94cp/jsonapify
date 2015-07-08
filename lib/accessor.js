var _ = require('lodash');
var Const = require('./accessors/const');

function isValidAccessor(object) {
	return _.isFunction(object.serialize) &&
	       _.isFunction(object.deserialize);
}

function createAccessor(object) {
	return (_.isUndefined(object) || !isValidAccessor(object))
	           ? new Const(object)
	           : object;
}

exports.create = createAccessor;
exports.isValid = isValidAccessor;
