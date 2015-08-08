var _ = require('lodash');

var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Template(format) {
	var self = this;
	this._strings = [];
	this._values = [];
	var chunks = format.split(/\$\{([^\}]*)\}/);
	_(chunks).chunk(2).forEach(function(stringValue) {
		self._strings.push(stringValue[0]);
		if (stringValue.length > 1)
			self._values.push(stringValue[1]);
	}).run();
}

Template.prototype.accessProperty = function(callback) {
	_.each(this._values, callback);
};

Template.prototype.serialize = function(field, transaction, object, callback) {
	var values = _.map(this._values, _.partial(_.get, object));
	if (_.any(values, _.isUndefined)) return callback(null);
	var result = _(this._strings).zip(values).flatten().value().join('');
	callback(null, result);
};

Template.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	if (!_.isString(resdata)) return callback(new InvalidFieldValue(field, resdata));
	callback(null, object);
};

module.exports = Template;
