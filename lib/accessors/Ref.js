var _ = require('lodash');
var async = require('async');
var ObjectId = require('mongodb').ObjectId;

var errors = require('../errors');
var ResourceNotFound = errors.ResourceNotFound;
var InvalidFieldValue = errors.InvalidFieldValue;

function Ref(resource, thisPath, opts) {
	opts = opts || {};
	this._resource = resource;
	this._thisPath = thisPath;
	this._links = opts.links;
	this._meta = opts.meta;
}

Ref.prototype.adjustQuery = function(query, action) {
	switch (action) {
	case 'select':
		query.select(this._thisPath);
		return true;
	default:
		return false;
	}
};

Ref.prototype.serialize = function(field, transaction, object, callback) {
	var self = this;
	var id = _.get(object, this._thisPath);
	if (_.isUndefined(id)) return callback(null);
	var resource = this._resource;
	var resview = resource.view(transaction);
	resview.findOne({ _id: id }, function(err, data) {
		if (err) return callback(err);
		if (!data) return callback(new ResourceNotFound(resource, { _id: id }));
		resview.serialize(transaction, data, function(err, linked) {
			if (err) return callback(err);
			var resdata = _.pick(linked, 'type', 'id');
			var isIncluded = transaction.transform(field.resource, 'include', field.name, true);
			if (isIncluded)
				resource.response.include(resdata.type, resdata.id, linked);
			if (self._meta) resdata.meta = self._meta;
			if (self._links) resdata.links = self._links;
			callback(null, resdata);
		});
	});
};

Ref.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	if (resdata.type !== this._resource.type || !Object.isValid(resdata.id))
		return callback(new InvalidFieldValue(field, resdata));
	_.set(object, this._thisPath, resdata.id);
	callback(null, object);
};

module.exports = Ref;
