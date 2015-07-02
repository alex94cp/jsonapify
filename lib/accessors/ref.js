var _ = require('lodash');
var async = require('async');
var accessor = require('../accessor');

function Ref(resource, thisPath, thatPath, opts) {
	if (_.isUndefined(opts) && _.isPlainObject(thatPath)) {
		opts = thatPath;
		thatPath = undefined;
	}
	
	opts = opts || {};
	thatPath = thatPath || '_id';
	
	this._resource = resource;
	this._thisPath = thisPath;
	this._thatPath = thatPath;
	this._links = opts.links;
	this._meta = opts.meta;
}

function createRef(resource, field) {
	return new Ref(resource, field);
}

Ref.prototype.serialize = function(object, response, cb) {
	function resolveRef() {
		var filter = {};
		var value = _.get(object, self._thisPath);
		_.set(filter, self._thatPath, value);
		return filter;
	}
	
	function relatedLink(related, cb) {
		var resource = self._resource;
		var idAccessor = resource.id;
		var typeAccessor = resource.type;
		async.parallel({
			id: idAccessor.serialize.bind(idAccessor, related, response),
			type: typeAccessor.serialize.bind(typeAccessor, related, response),
		}, cb);
	}
	
	function makeRelData(related, cb) {
		!_.isNull(related)
			? relatedLink(related, cb)
			: _.defer(cb, null, null)
	}
	
	function getField(object, field, cb) {
		(!_.isUndefined(field) && accessor.isValidRead(field))
			? field.serialize(object, response, cb)
			: _.defer(cb, null, field);
	}
	
	function doSerialize(resource, object, cb) {
		var output = {};
		resource.serialize(object, response, output, function(err) {
			err ? cb(err) : cb(null, output);
		});
	}
	
	var self = this;
	var filter = resolveRef();
	var model = this._resource.model;
	model.findOne(filter, function(err, related) {
		if (err) return cb(err);
		async.parallel({
			relData: async.apply(makeRelData, related),
			relMeta: async.apply(getField, object, self._meta),
			relLinks: async.apply(getField, object, self._links),
			includeId: async.apply(getField, related, self._resource.id),
			includeType: async.apply(getField, related, self._resource.type),
			includeData: async.apply(doSerialize, self._resource, related),
		}, function(err, results) {
			if (err) return cb(err);
			response.include(results.includeType,
			                 results.includeId,
			                 results.includeData);
			cb(null, _.omit({
				data: results.relData,
				meta: results.relMeta,
				links: results.relLinks,
			}, _.isEmpty));
		});
	});
};

Ref.prototype.deserialize = function(resdata, response, object, cb) {
	var id = resdata.data ? resdata.data.id : null;
	_.set(object, this._thisPath, id);
	_.defer(cb, null);
};

module.exports = exports = Ref;
exports.create = createRef;
