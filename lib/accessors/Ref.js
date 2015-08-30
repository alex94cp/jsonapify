var inherits = require('util').inherits;

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Accessor = require('../Accessor');
var Registry = require('../Registry');
var ResourceNotFound = require('../errors/ResourceNotFound');
var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Ref(resourceName, thisPath, opts) {
	opts = opts || {};
	this._resourceName = resourceName;
	this._thisPath = thisPath;
	this._links = opts.links;
	this._meta = opts.meta;
}

inherits(Ref, Accessor);

Ref.prototype.accessProperty = function(callback) {
	callback(this._thisPath);
};

Ref.prototype.serialize = function(field, transaction, object, callback) {
	var self = this;
	var id = _.get(object, this._thisPath);
	if (_.isUndefined(id)) return callback(null);
	var resource = Registry.get(this._resourceName);
	var response = transaction.response;
	var resview = resource.view(transaction);
	resview.findOne({ _id: id }, function(err, linked) {
		if (err) return callback(err);
		if (!linked) return callback(new ResourceNotFound(resource, { _id: id }));
		resview.serialize(linked, function(err, linkedData) {
			if (err) return callback(err);
			var resdata = _.pick(linkedData, 'type', 'id');
			var isIncluded = transaction.transform(field.resource, 'include', field.name, true);
			if (isIncluded)
				response.include(resdata.type, resdata.id, linkedData);
			if (self._meta) resdata.meta = self._meta;
			if (self._links) resdata.links = self._links;
			callback(null, resdata);
		});
	});
};

Ref.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	if (!_.isPlainObject(resdata)) return callback(new InvalidFieldValue(field, resdata));
	if (resdata.type !== Registry.get(this._resourceName).type || !ObjectId.isValid(resdata.id))
		return callback(new InvalidFieldValue(field, resdata));
	_.set(object, this._thisPath, new ObjectId(resdata.id));
	callback(null, object);
};

module.exports = Ref;
