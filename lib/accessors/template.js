var _ = require('lodash');

function Template(format) {
	this._format = format;
}

function createTemplate(format) {
	return new Template(format);
}

Template.prototype.serialize = function(object, response, cb) {
	var string = applyFormatString(this._format, object);
	_.defer(cb, null, string);
	
	function applyFormatString(format, object) {
		var re = /\{([^}]*)\}/g;
		return format.replace(re, function(match, path) {
			return _.get(object, path)
		});
	}
};

Template.prototype.deserialize = function(resdata, response, object, cb) {
	_.defer(cb, null, object);
};

module.exports = exports = Template;
exports.create = createTemplate;
