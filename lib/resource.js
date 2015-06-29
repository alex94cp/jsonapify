var _ = require('lodash');
var async = require('async');

function Resource(model, template) {
	this._model = model;
	this._template = template;
}

function createResource(model, opts) {
	return new Resource(model, opts);
}

Object.defineProperty(Resource.prototype, 'model', {
	get: function() { return this._model },
});

Object.defineProperty(Resource.prototype, 'type', {
	get: function() { return this._template.type; },
});

Object.defineProperty(Resource.prototype, 'id', {
	get: function() { return this._template.id; },
});

function isValidSerializer(object) {
	return _.isFunction(object.serialize);
}

function serializeObject(template, object, response, output, cb) {
	var pairs = _(template).pairs();
	async.map(pairs, function(pair, cb) {
		var first = _.first(pair);
		var second = _.last(pair);
		if (_.isPlainObject(second)) {
			if (_.has(object, first)) {
				var subfield = object[first];
				serializeObject(second, subfield, response, output, cb);
			}
		} else if (isValidSerializer(second)) {
			second.serialize(object, response, output, cb);
		}
	}, _.ary(cb, 1)); // ignore results
}

Resource.prototype.serialize = function(object, response, output, cb) {
	serializeObject(this._template, object, response, output, cb);
};

function isValidDeserializer(object) {
	return _.isFunction(object.deserialize);
}

function deserializeObject(template, resdata, response, output, cb) {
	var pairs = _.pairs(template);
	async.map(pairs, function(pair, cb) {
		var first = _.first(pair);
		var second = _.last(pair);
		if (_.isPlainObject(second)) {
			if (_.has(resdata, first)) {
				var subfield = resdata[first];
				deserializeObject(second, subfield, response, output, cb);
			}
		} else if (isValidDeserializer(second)) {
			second.deserialize(data, response, output, cb);
		}
	}, _.ary(cb, 1)); // ignore results
}

Resource.prototype.deserialize = function(resdata, response, output, cb) {
	deserializeObject(this._template, resdata, response, output, cb);
};

module.exports = exports = Resource;
exports.create = createResource;
