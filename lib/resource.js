var _ = require('lodash');

function Resource(model, template) {
	template = _.defaults(template, {
		meta: {},
		links: {},
		included: [],
		attributes: {},
		relationships: {},
	});
	
	if (!(this instanceof Resource))
		return new Resource(model, template);
	
	function isValidTemplate(object) {
		return object.id !== undefined &&
		       object.type !== undefined &&
		       object.meta !== undefined &&
		       object.links !== undefined &&
		       object.included !== undefined &&
		       object.attributes !== undefined &&
		       object.relationships !== undefined;
	}
	
	if (!isValidTemplate(template))
		throw new TypeError('invalid opts');
	
	this._model = model;
	this._template = template;
}

Object.defineProperty(Resource.prototype, 'model', {
	get: function() { return this._model; },
});

Object.defineProperty(Resource.prototype, 'id', {
	get: function() { return this._template.id; },
});

function isValidReadAccessor(object) {
	return object.get !== undefined;
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
	return object.set !== undefined;
}

function unwrapTemplate(template, data, result) {
	result = result || {};
	var pairs = _.pairs(template);
	for (var i = 0; i < pairs.length; ++i) {
		var first = pairs[i][0];
		var second = pairs[i][1];
		if (_.isPlainObject(second))
			unwrapTemplate(second, data[first], result);
		else if (isValidWriteAccessor(second))
			second.set(result, data[first]);
	}
	return result;
}

Resource.prototype.unwrap = function(data) {
	return unwrapTemplate(this._template, data);
};

module.exports = Resource;
