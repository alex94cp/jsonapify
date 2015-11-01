var inherits = require('util').inherits;

var _ = require('lodash');

var Accessor = require('../Accessor');
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

inherits(Template, Accessor);

Template.prototype.visitProperties = function(callback) {
	_.each(this._values, callback);
};

Template.prototype.serialize = function(field, transaction, object, done) {
	var values = _.map(this._values, _.partial(_.get, object));
	if (_.any(values, _.isUndefined)) return done(null);
	var result = _(this._strings).zip(values).flatten().value().join('');
	done(null, result);
};

Template.prototype.deserialize = function(field, transaction, resdata, object, done) {
	if (!_.isString(resdata))
		return done(new InvalidFieldValue(field, resdata));
	done(null, object);
};

module.exports = Template;
