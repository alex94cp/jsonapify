var _ = require('lodash');
var async = require('async');
var Const = require('./const');

function makeAccessor(object) {
	function isValidAccessor(object) {
		return _.isFunction(object.serialize) &&
		       _.isFunction(object.deserialize);
	}
	
	return !(_.isUndefined(object) &&
	         isValidAccessor(object))
	           ? new Const(object)
	           : object;
}

function Resource(model, template) {
	this._model = model;
	this._template = template;
	this._id = makeAccessor(template.id);
	this._type = makeAccessor(template.type);
}

function createResource(model, template) {
	return new Resource(model, template);
}

Object.defineProperty(Resource.prototype, 'model', {
	get: function() { return this._model },
});

Object.defineProperty(Resource.prototype, 'type', {
	get: function() { return this._type; },
});

Object.defineProperty(Resource.prototype, 'id', {
	get: function() { return this._id; },
});

function isValidSerializer(object) {
	return _.isFunction(object.serialize);
}

function serializeObject(template, object, response, output, cb) {
	var pairs = _.pairs(template);
	async.map(pairs, function(pair, cb) {
		var first = _.first(pair);
		var second = _.last(pair);
		if (_.isPlainObject(second)) {
			output[first] = {};
			serializeObject(second, object, response, output[first], cb);
		} else if (isValidSerializer(second)) {
			second.serialize(object, response, function(err, value) {
				if (err) return cb(err);
				if (!_.isUndefined(value))
					output[first] = value;
				cb();
			});
		} else {
			output[first] = second;
			_.defer(cb);
		}
	}, cb); // ignore results
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
		var subfield = resdata[first];
		if (_.isUndefined(subfield))
			return _.defer(cb);
		if (_.isPlainObject(second)) {
			output[first] = {};
			deserializeObject(second, subfield, response, output, cb);
		} else if (isValidDeserializer(second)) {
			second.deserialize(subfield, response, output, function(err, value) {
				if (err) return cb(err);
				if (!_.isUndefined(value))
					output[first] = value;
				cb();
			});
		} else {
			_.defer(cb);
		}
	}, cb); // ignore results
}

Resource.prototype.deserialize = function(resdata, response, output, cb) {
	deserializeObject(this._template, resdata, response, output, cb);
};

module.exports = exports = Resource;
exports.create = createResource;
