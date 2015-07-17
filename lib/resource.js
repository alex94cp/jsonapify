var _ = require('lodash');
var util = require('util');
var async = require('async');
var Field = require('./field');
var ResourceView = require('./resourceView');

function Resource(model, template, opts) {
	opts = opts || {};
	template = template || {};
	var type = opts.type || template.type;
	var fields = extractFields();
	
	this._type = type;
	this._model = model;
	this._fields = fields;
	this._rview = new ResourceView(this, fields);
	
	Resource.register(this);
	
	function extractFields() {
		return extractFieldsIter(template, '', []);
	}
	
	function extractFieldsIter(value, path, fields) {
		return _.reduce(value, function(fields, value, key) {
			var name = path ? util.format('%s.%s', path, key) : key;
			if (isFieldDescriptor(value)) {
				var opts = value;
				var value = opts.value;
				opts = _.omit(opts, 'value');
				var field = new Field(name, value, opts);
				fields.push(field);
			} else if (_.isPlainObject(value)) {
				extractFieldsIter(value, name, fields);
			} else {
				var field = new Field(name, value);
				fields.push(field);
			}
			return fields;
		}, fields);
	}
	
	function isFieldDescriptor(object) {
		return _.isPlainObject(object) &&
		       _.has(object, 'value') &&
		       allKeysAllowed(object);
	}
	
	function allKeysAllowed(object) {
		var allowed = ['value', 'readable', 'writable', 'nullable'];
		return _(object).keys().all(function(key) {
			return _.contains(allowed, key);
		});
	}
}

function createResource(model, template) {
	return new Resource(model, template);
}

(function() {
	var registry = {};
	
	Resource.register = function(typeName, resource) {
		if (typeName instanceof Resource && !resource) {
			resource = typeName;
			typeName = resource.type;
		}
		registry[typeName] = resource;
	};
	
	Resource.byType = function(typeName) {
		return registry[typeName];
	};
})();

Object.defineProperty(Resource.prototype, 'model', {
	get: function() { return this._model; },
});

Object.defineProperty(Resource.prototype, 'type', {
	get: function() { return this._type; },
});

Resource.prototype.field = function(name) {
	return this._rview.field(name);
};

Resource.prototype.select = function(fields) {
	return this._rview.select(fields);
};

Resource.prototype.sort = function(byFields) {
	return this._rview.sort(byFields);
};

Resource.prototype.find = function(filter, cb) {
	return this._rview.find(filter, cb);
};

Resource.prototype.findOne = function(filter, cb) {
	return this._rview.findOne(filter, cb);
};

Resource.prototype.serialize = function(object, response, cb) {
	this._rview.serialize(object, response, cb);
};

Resource.prototype.deserialize = function(resdata, response, output, cb) {
	this._rview.deserialize(resdata, response, output, cb);
};

module.exports = exports = Resource;
exports.create = createResource;
