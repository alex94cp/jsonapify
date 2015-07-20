var _ = require('lodash');
var async = require('async');
var ObjectId = require('mongodb').ObjectId;

var errors = require('../errors');
var ResourceNotFound = errors.ResourceNotFound;
var InvalidFieldValue = errors.InvalidFieldValue;

function Refs(resource, thisPath, opts) {
	opts = opts || {};
	this._resource = resource;
	this._thisPath = thisPath;
}

Refs.prototype.adjustQuery = function(query, action) {
	switch (action) {
	case 'select':
		query.select(this._thisPath);
		return true;
	default:
		return false;
	}
};

Refs.prototype.serialize = function(field, transaction, object, callback) {
	var self = this;
	var ids = _.get(object, this._thisPath);
	if (_.isUndefined(ids)) return callback(null);
	var resource = this._resource;
	var resview = resource.view(transaction);
	var isIncluded = transaction.transform(field.resource, 'include', field.name, true);
	async.map(ids, function(id, next) {
		resview.findOne({ _id: id }, function(err, data) {
			if (err) return next(err);
			if (!data) return new ResourceNotFound(resource, { _id: id });
			resview.serialize(transaction, data, function(err, resdata) {
				if (err) return next(err);
				var link = _.pick(resdata, 'type', 'id');
				if (isIncluded)
					transaction.response(link.type, link.id, resdata);
				next(null, link);
			});
		});
	}, function(err, links) {
		err ? callback(err) : callback(null, links);
	});
};

Refs.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	var self = this;
	var links = [];
	_.set(object, this._thisPath, links);
	_.each(resdata, function(link) {
		if (link.type !== self._resource.type || !ObjectId.isValid(link.id))
			return callback(new InvalidFieldValue(field, resdata));
		links.push(link);
	});
	callback(null, object);
};

module.exports = Ref;
