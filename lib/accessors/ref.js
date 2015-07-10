var _ = require('lodash');
var async = require('async');

function Ref(resource, thisPath, thatPath, opts) {
	if (_.isUndefined(opts) && _.isPlainObject(thatPath)) {
		opts = thatPath;
		thatPath = undefined;
	}
	
	thatPath = thatPath || '_id';
	opts = _.defaults({}, opts);
	
	this._resource = resource;
	this._thisPath = thisPath;
	this._thatPath = thatPath;
	this._links = opts.links;
	this._meta = opts.meta;
}

function createRef(resource, field) {
	return new Ref(resource, field);
}

function isValidAccessor(object) {
	return !_.isUndefined(object.serialize) &&
	       !_.isUndefined(object.deserialize);
}

Ref.prototype.serialize = function(object, response, cb) {
	function resolveRef() {
		var filter = {};
		var value = _.get(object, self._thisPath);
		_.set(filter, self._thatPath, value);
		return filter;
	}
	
	function getField(object, field, cb) {
		isValidAccessor(field)
			? field.serialize(object, response, cb)
			: _.defer(cb, null, field);
	}
	
	function wrapResults(resource, object, cb) {
		object ? resource.serialize(object, response, cb)
		       : _.defer(cb, null, null);
	}
	
	function makeRelData(data) {
		return _.pick(data, ['type', 'id']);
	}
	
	var self = this;
	var filter = resolveRef();
	var refResource = this._resource;
	var model = this._resource.model;
	model.findOne(filter, function(err, related) {
		if (err) return cb(err);
		if (!related) return cb(null, { data: null });
		async.parallel({
			data: function(cb) {
				wrapResults(refResource, related, cb);
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
};

Ref.prototype.deserialize = function(resdata, response, object, cb) {
	var id = resdata.data ? resdata.data.id : null;
	_.set(object, this._thisPath, id);
	_.defer(cb, null, object);
};

module.exports = exports = Ref;
exports.create = createRef;
