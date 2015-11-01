var inherits = require('util').inherits;

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Runtime = require('../Runtime');
var Accessor = require('../Accessor');
var ResourceNotFound = require('../errors/ResourceNotFound');
var InvalidFieldValue = require('../errors/InvalidFieldValue');

function Refs(resourceName, thisPath, opts) {
	opts = opts || {};
	this._resourceName = resourceName;
	this._thisPath = thisPath;
}

inherits(Refs, Accessor);

Refs.prototype.accessProperties = function(callback) {
	callback(this._thisPath);
};

Refs.prototype.serialize = function(field, transaction, object, done) {
	var self = this;
	var ids = _.get(object, this._thisPath);
	if (_.isUndefined(ids)) return done(null);
	var resource = Runtime.getResource(this._resourceName);
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
		err ? done(err) : done(null, links);
	});
};

Refs.prototype.deserialize = function(field, transaction, resdata, object, done) {
	if (!_.isArray(resdata))
		return done(new InvalidFieldValue(field, resdata));
	var self = this;
	var links = [];
	var target = Runtime.getResource(self._resourceName);
	_.set(object, this._thisPath, links);
	_.each(resdata, function(link, index) {
		if (link.type !== target.type || !ObjectId.isValid(link.id)) {
			var opts = { meta: { index: index }};
			var err = new InvalidFieldValue(field, resdata, opts);
			return done(err);
		}
		var id = new ObjectId(link.id);
		links.push(id);
	});
	done(null, object);
};

module.exports = Refs;
