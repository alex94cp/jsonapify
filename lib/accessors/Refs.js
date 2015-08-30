var inherits = require('util').inherits;

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Accessor = require('../Accessor');
var Registry = require('../Registry');
var ResourceNotFound = require('../errors/ResourceNotFound');
var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Refs(resourceName, thisPath, opts) {
	opts = opts || {};
	this._resourceName = resourceName;
	this._thisPath = thisPath;
}

inherits(Refs, Accessor);

Refs.prototype.accessProperty = function(callback) {
	callback(this._thisPath);
};

Refs.prototype.serialize = function(field, transaction, object, callback) {
	var self = this;
	var ids = _.get(object, this._thisPath);
	if (_.isUndefined(ids)) return callback(null);
	var resource = Registry.get(this._resourceName);
	var response = transaction.response;
	var resview = resource.view(transaction);
	var isIncluded = transaction.transform(field.resource, 'include', field.name, true);
	async.map(ids, function(id, next) {
		resview.findOne({ _id: id }, function(err, linked) {
			if (err) return next(err);
			if (!linked) return new ResourceNotFound(resource, { _id: id });
			resview.serialize(linked, function(err, linkedData) {
				if (err) return next(err);
				var link = _.pick(linkedData, 'type', 'id');
				if (isIncluded)
					response.include(link.type, link.id, linkedData);
				next(null, link);
			});
		});
	}, function(err, links) {
		err ? callback(err) : callback(null, links);
	});
};

Refs.prototype.deserialize = function(field, transaction, resdata, object, callback) {
	if (!_.isArray(resdata))
		return callback(new InvalidFieldValue(field, resdata));
	var self = this;
	var links = [];
	_.set(object, this._thisPath, links);
	_.each(resdata, function(link, index) {
		if (link.type !== Registry.get(self._resourceName).type || !ObjectId.isValid(link.id)) {
			var opts = { meta: { index: index }};
			var err = new InvalidFieldValue(field, resdata, opts);
			return callback(err);
		}
		var id = new ObjectId(link.id);
		links.push(id);
	});
	callback(null, object);
};

module.exports = Refs;
