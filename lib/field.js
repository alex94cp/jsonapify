var _ = require('lodash');

function Field(path) {
	this._path = path;
}

function createField(path) {
	return new Field(path);
}

Field.prototype.serialize = function(object, response, cb) {
	cb(null, _.get(object, this._path));
};

Field.prototype.deserialize = function(resdata, response, object, cb) {
	_.set(object, this._path, resdata);
	cb();
};

module.exports = exports = Field;
exports.create = createField;
