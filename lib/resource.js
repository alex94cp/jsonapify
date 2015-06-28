var _ = require('lodash');
var util = require('util');
var Field = require('./accessors/field');
var Format = require('./accessors/format');

function Resource(model, template) {
	this._model = model;
	this._template = template;
}

function defaultIdFor(model) {
	var result = new Field('_id');
	defaultIdFor = _.constant(result)
	return result;
}

function defaultTypeFor(model) {
	return model.collection.name;
}

function defaultSelfLinkFor(model) {
	var defaultId = '_id';
	var defaultType = model.collection.name;
	var link = util.format('/%s/{%s}', defaultType, defaultId);
	return new Format(link);
}

function createResource(model, template) {
	template = _.defaults(template || {}, {
		id: defaultIdFor(model),
		type: defaultTypeFor(model),
		links: {
			self: defaultSelfLinkFor(model),
		},
	});
	
	return new Resource(model, template);
}

Object.defineProperty(Resource.prototype, 'model', {
	get: function() { return this._model; },
});

Object.defineProperty(Resource.prototype, 'id', {
	get: function() { return this._template.id; },
});

function isValidReadAccessor(object) {
	return object.get instanceof Function;
}

function wrapTemplate(template, object) {
	var result = {};
	var pairs = _.pairs(template);
	for (var i = 0; i < pairs.length; ++i) {
		var first = pairs[i][0];
		var second = pairs[i][1];
		if (isValidReadAccessor(second))
			second = second.get(object);
		else if (_.isPlainObject(second))
			second = wrapTemplate(second, object);
		if (second !== undefined)
			result[first] = second;
	}
	return result;
}

Resource.prototype.wrap = function(object) {
	return wrapTemplate(this._template, object);
};

function isValidWriteAccessor(object) {
	return object.set instanceof Function;
}

function unwrapTemplate(template, data, result) {
	result = result || {};
	var pairs = _.pairs(template);
	for (var i = 0; i < pairs.length; ++i) {
		var first = pairs[i][0];
		var second = pairs[i][1];
		if (_.isPlainObject(second)) {
			if (!_.isUndefined(data[first]))
				unwrapTemplate(second, data[first], result);
		} else if (isValidWriteAccessor(second))
			second.set(result, data[first]);
	}
	return result;
}

Resource.prototype.unwrap = function(data) {
	return unwrapTemplate(this._template, data);
};

module.exports = exports = Resource;
exports.create = createResource;
