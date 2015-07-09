var _ = require('lodash');
var util = require('util');
var async = require('async');
var Field = require('./field');

function extractFields(template) {
	function isFieldDescriptor(object) {
		return _.has(object, 'value');
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
	
	return extractFieldsIter(template, '', []);
}

function Resource(model, template) {
	this._model = model;
	template = template || {};
	this._fields = extractFields(template);
}

function createResource(model, template) {
	return new Resource(model, template);
}

Object.defineProperty(Resource.prototype, 'model', {
	get: function() { return this._model },
});

Object.defineProperty(Resource.prototype, 'id', {
	get: function() { return _.find(this._fields, { name: 'id' }); },
});

Object.defineProperty(Resource.prototype, 'type', {
	get: function() { return _.find(this._fields, { name: 'type' }); },
});

Resource.prototype.field = function(name) {
	return _.find(this._fields, { name: name });
};

Resource.prototype.serialize = function(object, response, cb) {
	async.map(this._fields, function(field, cb) {
		field.serialize(object, response, function(err, value) {
			err ? cb(err) : cb(null, [field.name, value]);
		});
	}, function(err, results) {
		if (err) return cb(err);
		var object = _.reduce(results, function(object, result) {
			var name = result[0];
			var value = result[1];
			if (!_.isUndefined(value))
				_.set(object, name, value);
			return object;
		}, {});
		cb(null, object);
	});
};

Resource.prototype.deserialize = function(resdata, response, output, cb) {
	async.each(this._fields, function(field, cb) {
		var value = _.get(resdata, field.name);
		field.deserialize(value, response, output, cb);
	}, function(err) {
		err ? cb(err) : cb(null, output);
	});
};

module.exports = exports = Resource;
exports.create = createResource;
