var _ = require('lodash');

function FormatAccessor(format) {
	if (!(this instanceof FormatAccessor))
		return new FormatAccessor(format);
	
	this._format = format;
}

FormatAccessor.prototype.get = function(object) {
	return this._format.replace(/\{([^}]+)\}/g,
		function(matched, path, offset) {
			return _.get(object, path);
		});
};

FormatAccessor.prototype.set = function(object, value) {
	return undefined;
};

module.exports = FormatAccessor;
