var _ = require('lodash');
var async = require('async');

function Ref(resource, thisProperty, thatProperty, opts) {
	if (_.isUndefined(opts) && _.isPlainObject(thatProperty)) {
		opts = thatProperty;
		thatProperty = undefined;
	}
	
	opts = opts || {};
	thatProperty = thatProperty || '_id';
	
	this._meta = opts.meta;
	this._links = opts.links;
	this._resource = resource;
	this._thisProperty = thisProperty;
	this._thatProperty = thatProperty;
}

function createRef(resource, field) {
	return new Ref(resource, field);
}

Ref.prototype.serialize = function(object, response, cb) {
	var self = this;
	var filter = resolveRef(this);
	var refResource = this._resource;
	refResource.model.findOne(filter, function(err, related) {
		if (err) return cb(err);
		if (!related) return cb(null, { data: null });
		async.parallel({
			data: function(cb) {
				refResource.serialize(related, response, cb);
			},
			meta: function(cb) {
				if (_.isUndefined(self._meta)) return cb(null);
				getField(object, self._meta, cb);
			},
			links: function(cb) {
				if (_.isUndefined(self._links)) return cb(null);
				getField(object, self._links, cb);
			},
		}, function(err, results) {
			if (err) return cb(err);
			var data = results.data;
			var resdata = { data: makeRelData(data) };
			if (!_.isUndefined(results.meta)) resdata.meta = results.meta;
			if (!_.isUndefined(results.links)) resdata.links = results.links;
			response.include(data.type, data.id, data);
			cb(null, resdata);
		});
	});
	
	function resolveRef(self) {
		var value = _.get(object, self._thisProperty);
		return _.set({}, self._thatProperty, value);
	}
	
	function makeRelData(data) {
		return _.pick(data, ['type', 'id']);
	}
	
	function getField(object, field, cb) {
		isValidAccessor(field)
			? field.serialize(object, response, cb)
			: _.defer(cb, null, field);
	}
	
	function isValidAccessor(object) {
		return !_.isUndefined(object.serialize) &&
		       !_.isUndefined(object.deserialize);
	}
};

Ref.prototype.deserialize = function(resdata, response, object, cb) {
	var id = resdata.data ? resdata.data.id : null;
	_.set(object, this._thisProperty, id);
	_.defer(cb, null, object);
};

module.exports = exports = Ref;
exports.create = createRef;
