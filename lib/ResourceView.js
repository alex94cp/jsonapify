var util = require('util');

var _ = require('lodash');
var async = require('async');

function ResourceView(transaction, resource, fields, orderBy) {
	if (transaction instanceof ResourceView) {
		var resview = transaction;
		copyFrom(this, resview);
		if (_.isPlainObject(resource)) {
			var opts = resource;
			applyOptions(this, opts);
		}
	} else {
		orderBy = orderBy || [];
		this._root = this;
		this._transaction = transaction;
		this._resource = resource;
		setFields(this, fields);
		this._orderBy = orderBy;
	}
}

function copyFrom(self, resview) {
	self._root = resview._root;
	self._transaction = resview._transaction;
	self._resource = resview._resource;
	self._fields = resview._fields;
	self._orderBy = resview._orderBy;
	self._readableFields = resview._readableFields;
	self._writableFields = resview._writableFields;
}

function applyOptions(self, opts) {
	if (opts.fields) setFields(self, opts.fields);
	if (opts.orderBy) self._orderBy = opts.orderBy;
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
	names = requiredFields.concat(names);
	var selected = _(names).map(function(name) {
		return self.field(name);
	}).compact().uniq().value();
	return new ResourceView(this, { fields: selected });
};

ResourceView.prototype.sort = function(names) {
	var self = this;
	if (!_.isArray(names)) names = [names];
	var orderBy = _(names).map(function(name) {
		var field = null, order = 1;
		if (_.startsWith(name, '+')) {
			field = self._root.field(name.slice(1));
		} else if (_.startsWith(name, '-')) {
			order = -1;
			field = self._root.field(name.slice(1));
		} else {
			field = self._root.field(name);
		}
		if (!field) return null;
		return { field: field, order: order };
	}).compact().value();
	return new ResourceView(this, { orderBy: orderBy });
};

ResourceView.prototype.findOne = function(filter, callback) {
	var transaction = this._transaction;
	var query = this.model.findOne(filter);
	querySelectFields(query, this._fields);
	transaction.notify(this._resource, 'query', query);
	if (!callback) return query;
	query.exec(callback);
};

ResourceView.prototype.findMany = function(filter, callback) {
	var transaction = this._transaction;
	var query = this.model.find(filter);
	querySelectFields(query, this._fields);
	queryOrderFields(query, this._orderBy);
	transaction.notify(this._resource, 'query', query);
	if (!callback) return query;
	query.exec(callback);
};

function querySelectFields(query, fields) {
	_.each(fields, function(field) {
		field.adjustQuery(query, 'select');
	});
}

function queryOrderFields(query, orderBy) {
	_.each(orderBy, function(opts) {
		opts.field.adjustQuery(query, 'sort', opts.order);
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
