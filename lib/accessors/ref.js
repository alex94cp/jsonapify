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

Ref.prototype.adjustQuery = function(query, action) {
	var opts = _.slice(arguments, 2);
	switch(action) {
	case 'select':
		query.select(this._thisProperty);
		return true;
	default:
		return false;
	}
};

Ref.prototype.serialize = function(object, response, cb) {
	var resource = this._resource;
	var id = _.get(object, this._thisProperty);
	resource.findOne({ _id: id }, function(err, relObject) {
		if (err) return cb(err);
		if (!relObject) return cb(null, { data: null });
		resource.serialize(relObject, response, function(err, relData) {
			if (err) return cb(err);
			response.include(relData.type, relData.id, relData);
			cb(null, { data: _.pick(relData, 'type', 'id') });
		});
	});
};

Ref.prototype.deserialize = function(resdata, response, object, cb) {
	var id = _.get(resdata, 'data.id');
	var type = _.get(resdata, 'data.type');
	if (id) id = new mongoose.Types.ObjectId(id);
	_.set(object, this._thisProperty, id);
	_.defer(cb, null, object);
};

module.exports = exports = Ref;
exports.create = createRef;
