var inherits = require('util').inherits;

var _ = require('lodash');

var Accessor = require('../Accessor');
var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Property(path) {
	this._path = path;
}

inherits(Property, Accessor);

Property.prototype.accessProperty = function(callback) {
	callback(this._path);
};

Property.prototype.serialize = function(field, transaction, object, callback) {
	var value = _.get(object, this._path);
	callback(null, value);
};

Property.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	_.set(object, this._path, resdata);
	callback(null, object);
};

module.exports = Property;
