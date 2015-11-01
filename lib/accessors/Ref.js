var inherits = require('util').inherits;

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Runtime = require('../Runtime');
var Accessor = require('../Accessor');
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

Ref.prototype.visitProperties = function(callback) {
	callback(this._thisPath);
};

Ref.prototype.serialize = function(field, transaction, object, done) {
	var self = this;
	var id = _.get(object, this._thisPath);
	if (_.isUndefined(id)) return done(null);
	var resource = Runtime.getResource(this._resourceName);
	var response = transaction.response;
	var resview = resource.view(transaction);
	resview.findOne({ _id: id }, function(err, linked) {
		if (err) return done(err);
		if (!linked) return done(new ResourceNotFound(resource, { _id: id }));
		resview.serialize(linked, function(err, linkedData) {
			if (err) return done(err);
			var resdata = _.pick(linkedData, 'type', 'id');
			var isIncluded = transaction.transform(field.resource, 'include', field.name, true);
			if (isIncluded)
				response.include(resdata.type, resdata.id, linkedData);
			if (self._meta) resdata.meta = self._meta;
			if (self._links) resdata.links = self._links;
			done(null, resdata);
		});
	});
};

Ref.prototype.deserialize = function(field, transaction, resdata, object, done) {
	if (!_.isPlainObject(resdata)) return done(new InvalidFieldValue(field, resdata));
	var target = Runtime.getResource(this._resourceName);
	if (resdata.type !== target.type || !ObjectId.isValid(resdata.id))
		return done(new InvalidFieldValue(field, resdata));
	_.set(object, this._thisPath, new ObjectId(resdata.id));
	done(null, object);
};

module.exports = Ref;
