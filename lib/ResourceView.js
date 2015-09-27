var util = require('util');

var _ = require('lodash');
var async = require('async');

function ResourceView(transaction, resource, fields) {
	if (transaction instanceof ResourceView) {
		var resview = transaction;
		copyFrom(this, resview);
		if (_.isPlainObject(resource)) {
			var opts = resource;
			applyOptions(this, opts);
		}
	} else {
		this._root = this;
		this._transaction = transaction;
		this._resource = resource;
		setFields(this, fields);
	}
}

function copyFrom(self, resview) {
	self._root = resview._root;
	self._transaction = resview._transaction;
	self._resource = resview._resource;
	self._fields = resview._fields;
	self._readableFields = resview._readableFields;
	self._writableFields = resview._writableFields;
}

function applyOptions(self, opts) {
	if (opts.fields) setFields(self, opts.fields);
}

function setFields(self, fields) {
	self._fields = {};
	self._readableFields = [];
	self._writableFields = [];
	_.each(fields, function(field) {
		self._fields[field.name] = field;
		if (field.readable) self._readableFields.push(field);
		if (field.writable) self._writableFields.push(field);
	});
}

Object.defineProperties(ResourceView.prototype, {
	type: { get: function() { return this._resource.type }},
	model: { get: function() { return this._resource.model }},
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

ResourceView.prototype.accessProperty = function(name, callback) {
	var field = this.field(name);
	if (field) field.accessProperty(callback);
};

ResourceView.prototype.select = function(names) {
	var self = this;
	if (!_.isArray(names)) names = [names];
	var selected = _(names).map(function(name) {
		return self.field(name);
	}).compact().uniq().value();
	return new ResourceView(this, { fields: selected });
};

ResourceView.prototype.findOne = function(filter, callback) {
	var transaction = this._transaction;
	var query = this.model.findOne(filter);
	querySelectFields(query, this._fields);
	transaction.notify(this, 'query', query);
	if (!callback) return query;
	query.exec(callback);
};

ResourceView.prototype.findMany = function(filter, callback) {
	var transaction = this._transaction;
	var query = this.model.find(filter);
	querySelectFields(query, this._fields);
	transaction.notify(this, 'query', query);
	if (!callback) return query;
	query.exec(callback);
};

function querySelectFields(query, fields) {
	_.each(fields, function(field) {
		field.accessProperty(function(property) {
			query.select(property);
		});
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
		if (!_.isUndefined(value)) {
			field.deserialize(self._transaction, value, object, next);
		} else {
			next();
		}
	}, function(err) {
		err ? callback(err) : callback(null, object);
	});
};

module.exports = ResourceView;
