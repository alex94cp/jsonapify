var _ = require('lodash');

function Property(path) {
	this._path = path;
}

function createProperty(path, opts) {
	return new Property(path, opts);
}

Property.prototype.adjustQuery = function(query) {
	query.select(this._path);
};

Property.prototype.serialize = function(object, response, cb) {
	_.defer(cb, null, _.get(object, this._path));
};

Property.prototype.deserialize = function(resdata, response, object, cb) {
	_.set(object, this._path, resdata);
	_.defer(cb, null, object);
};

module.exports = exports = Property;
exports.create = createProperty;
