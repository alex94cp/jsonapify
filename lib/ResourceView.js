var util = require('util');

var _ = require('lodash');
var async = require('async');

function ResourceView(transaction, resource, fields, opts) {
	var self = this;
	this._transaction = transaction;
	this._resource = resource;
	this._fields = {};
	this._readableFields = [];
	this._writableFields = [];
	_.each(fields, function(field) {
		self._fields[field.name] = field;
		if (field.readable) self._readableFields.push(field);
		if (field.writable) self._writableFields.push(field);
	});
}

Object.defineProperty(ResourceView.prototype, 'model', {
	get: function() { return this._resource.model; },
});

Object.defineProperty(ResourceView.prototype, 'type', {
	get: function() { return this._resource.type; },
});

ResourceView.prototype.field = function(name) {
	var self = this;
	var field = this._fields[name];
	if (field) return field;
	var knownFields = ['attributes', 'relationships'];
	_.each(knownFields, function(prefix) {
		var fullName = util.format('%s.%s', prefix, name);
		field = self._fields[fullName];
		if (field) return false;
	})
	return field;
};

ResourceView.prototype.select = function(names) {
	var self = this;
	if (!_.isArray(names)) names = [names];
	var requiredFields = ['type', 'id'];
	names.push.apply(names, requiredFields);
	var selected = _(names).map(function(name) {
		return self.field(name);
	}).compact().uniq().value();
	return new ResourceView(this._transaction, this._resource, selected);
};

ResourceView.prototype.findOne = function(filter, callback) {
	var transaction = this._transaction;
	var query = this.model.findOne(filter);
	querySelectFields(query, this._fields);
	query = transaction.transform(this._resource, 'query', query);
	if (!callback) return query;
	query.exec(callback);
};

ResourceView.prototype.findMany = function(filter, callback) {
	var transaction = this._transaction;
	var query = this.model.find(filter);
	querySelectFields(query, this._fields);
	query = transaction.transform(this._resource, 'query', query);
	if (!callback) return query;
	query.exec(callback);
};

function querySelectFields(query, fields) {
	_.each(fields, function(field) {
		field.adjustQuery(query, 'select');
	});
}

ResourceView.prototype.serialize = function(object, callback) {
	var self = this;
	var resdata = {};
	async.each(this._readableFields, function(field, next) {
		field.serialize(self._transaction, object, function(err, value) {
			if (err) return next(err);
			_.set(resdata, field.name, value);
			next();
		});
	}, function(err) {
		err ? callback(err) : callback(null, resdata);
	});
};

ResourceView.prototype.deserialize = function(resdata, object, callback) {
	var self = this;
	async.each(this._writableFields, function(field, next) {
		var value = _.get(resdata, field.name);
		field.deserialize(self._transaction, value, object, next);
	}, function(err) {
		err ? callback(err) : callback(null, object);
	});
};

module.exports = ResourceView;
