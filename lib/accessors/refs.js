var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

function Refs(resource, thisProperty, opts) {
	opts = opts || {};
	this._meta = opts.meta;
	this._links = opts.links;
	this._resource = resource;
	this._thisProperty = thisProperty;
}

function createRefs(resource, thisProperty, opts) {
	return new Refs(resource, thisProperty, opts);
}

Refs.prototype.serialize = function(object, response, cb) {
	var resource = this._resource;
	var ids = _.get(object, this._thisProperty);
	async.reduce(ids, [], function(rels, id, cb) {
		resource.model.findById(id, function(err, relObject) {
			if (err || !relObject) return cb(err);
			resource.serialize(relObject, response, function(err, relData) {
				if (err) return cb(err);
				var data = _.pick(relData, 'type', 'id');
				response.include(data.type, data.id, relData);
				rels.push(data);
				cb(null, rels);
			});
		});
	}, function(err, rels) {
		if (err) return cb(err);
		var resdata = { data: rels };
		cb(null, resdata);
	});
};

Refs.prototype.deserialize = function(resdata, response, object, cb) {
	var refs = [];
	_.set(object, this._thisProperty, refs);
	_.each(resdata.data, function(linked) {
		if (!linked.id) return;
		var id = new mongoose.Types.ObjectId(linked.id);
		refs.push(id);
	});
	_.defer(cb, null, object);
};

module.exports = exports = Refs;
exports.create = createRefs;
