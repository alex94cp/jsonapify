var _ = require('lodash');

function FormatAccessor(format) {
	if (!(this instanceof FormatAccessor))
		return new FormatAccessor(format);
	
	this._format = format;
}

function createFormat(format) {
	return new FormatAccessor(format);
}

FormatAccessor.prototype.get = function(object) {
	var re = /\{([^}]+)\}/g;
	return this._format.replace(re, function(matched, path, offset) {
		return _.get(object, path);
	});
};

FormatAccessor.prototype.set = function(object, value) {
	return undefined;
};

module.exports = exports = FormatAccessor;
exports.create = createFormat;
