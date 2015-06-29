var _ = require('lodash');

function Template(format) {
	this._format = format;
}

function createTemplate(format) {
	return new Template(format);
}

Template.prototype.serialize = function(object, response, cb) {
	var re = /\{([^}]+)\}/g;
	var value = this._format.replace(re, function(match, path) {
		return _.get(object, path);
	});
	_.defer(cb, null, value);
};

Template.prototype.deserialize = function(resdata, response, object, cb) {
	_.defer(cb);
};

module.exports = exports = Template;
exports.create = createTemplate;
