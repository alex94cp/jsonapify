function Accessor() {}

Accessor.prototype.visitProperties = function(callback) {};

Accessor.prototype.serialize = function(field, transaction, object, done) {
	done(null, undefined);
};

Accessor.prototype.deserialize = function(field, transaction, resdata, object, done) {
	done(null, object);
};

module.exports = Accessor;
