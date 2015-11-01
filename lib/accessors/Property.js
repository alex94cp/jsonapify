var inherits = require('util').inherits;

var _ = require('lodash');

var Accessor = require('../Accessor');
var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Property(path) {
	this._path = path;
}

inherits(Property, Accessor);

Property.prototype.visitProperties = function(callback) {
	callback(this._path);
};

Property.prototype.serialize = function(field, transaction, object, done) {
	var value = _.get(object, this._path);
	done(null, value);
};

Property.prototype.deserialize = function(field, transaction, resdata, object, done) {
	_.set(object, this._path, resdata);
	done(null, object);
};

module.exports = Property;
