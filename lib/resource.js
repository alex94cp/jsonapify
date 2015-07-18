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

function createResource(model, template) {
	return new Resource(model, template);
}

util.inherits(Resource, events.EventEmitter);

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
	var resview = new ResourceView(this._rview);
	this.emit('view', resview);
	return resview;
};

Resource.prototype.find = function(filter, cb) {
	return this.view().find(filter, cb);
};

Resource.prototype.findOne = function(filter, cb) {
	return this.view().findOne(filter, cb);
};

Resource.prototype.serialize = function(object, response, cb) {
	this.view().serialize(object, response, cb);
};

Resource.prototype.deserialize = function(resdata, response, object, cb) {
	this.view().deserialize(resdata, response, object, cb);
};

module.exports = exports = Resource;
exports.create = createResource;
