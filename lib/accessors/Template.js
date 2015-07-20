var _ = require('lodash');

function Template(format) {
	var self = this;
	this._values = [];
	this._strings = [];
	var chunks = format.split(/\$\{[^\}]*\}/);
	_(chunks).chunk(2).each(function(stringValue) {
		self._strings.push(stringValue[0]);
		self._values.push(stringValue[1]);
	});
}

Template.prototype.adjustQuery = function(query, action) {
	switch (action) {
	case 'select':
		_.each(this._values, function(value) {
			query.select(value);
		});
		return true;
	default:
		return false;
	}
};

Template.prototype.serialize = function(field, transaction, object, response, callback) {
	var values = _.map(this._values, _.partial(_.get, object));
	if (_.any(values, _.isUndefined)) return callback(null);
	var result = _(this._strings).zip(values).flatten().value().join();
	callback(null, result);
};

Template.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	callback(null, object);
};

module.exports = Template;
