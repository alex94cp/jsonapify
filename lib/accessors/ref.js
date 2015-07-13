var _ = require('lodash');
var mongoose = require('mongoose');

function Ref(resource, thisProperty, opts) {
	opts = opts || {};
	this._meta = opts.meta;
	this._links = opts.links;
	this._resource = resource;
	this._thisProperty = thisProperty;
}

function createRef(resource, thisProperty, opts) {
	return new Ref(resource, thisProperty, opts);
}

Ref.prototype.serialize = function(object, response, cb) {
	var resource = this._resource;
	var id = _.get(object, this._thisProperty);
	resource.model.findById(id, function(err, relObject) {
		if (err) return cb(err);
		if (!relObject) return cb(null, { data: null });
		resource.serialize(relObject, response, function(err, relData) {
			if (err) return cb(err);
			var resdata = { data: _.pick(relData, 'type', 'id') };
			response.include(resdata.type, resdata.id, relData);
			cb(null, resdata);
		});
	});
};

Ref.prototype.deserialize = function(resdata, response, object, cb) {
	var id = _.get(resdata, 'data.id', null);
	if (id) id = new mongoose.Types.ObjectId(id);
	_.set(object, this._thisProperty, id);
	_.defer(cb, null, object);
};

module.exports = exports = Ref;
exports.create = createRef;
