var _ = require('lodash');
var util = require('util');
var async = require('async');
var Field = require('./field');
var events = require('events');
var ResourceView = require('./resourceView');

function Resource(model, template, opts) {
	opts = opts || {};
	this._model = model;
	template = template || {};
	this._type = opts.type || template.type;
	var fields = this._fields = extractFields(template);
	this._rview = new ResourceView(this, fields);
	Object.freeze(this._rview);
	Resource.register(this);
	
	function extractFields(object) {
		return extractFieldsIter(object, '', []);
	}
	
	function extractFieldsIter(object, path, fields) {
		return _.reduce(object, function(fields, value, key) {
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

util.inherits(Resource, events.EventEmitter);

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

Resource.prototype.view = function() {
	return new ResourceView(this._rview);
};

Resource.prototype.find = function(filter, cb) {
	var resview = this.view();
	return resview.find(filter, cb);
};

Resource.prototype.field = function(name) {
	return this._rview.field(name);
};

Resource.prototype.findOne = function(filter, cb) {
	var resview = this.view();
	return resview.findOne(filter, cb);
};

Resource.prototype.serialize = function(object, response, cb) {
	this._rview.serialize(object, response, cb);
};

Resource.prototype.deserialize = function(resdata, response, output, cb) {
	this._rview.deserialize(resdata, response, output, cb);
};

module.exports = exports = Resource;
exports.create = createResource;
