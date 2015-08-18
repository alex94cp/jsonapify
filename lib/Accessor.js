function Accessor() {}

Accessor.prototype.accessProperty = function(callback) {};

Accessor.prototype.serialize = function(field, transaction, object, callback) {
	callback(null, undefined);
};

Accessor.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	callback(null, object);
};

module.exports = Accessor;
