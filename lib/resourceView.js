var _ = require('lodash');
var async = require('async');

function ResourceView(resource, fields, sortBy) {
	this._resource = resource;
	this._fields = fields;
	this._sortBy = sortBy;
}

Object.defineProperty(ResourceView.prototype, 'model', {
	get: function() { return this._resource.model; }
});

Object.defineProperty(ResourceView.prototype, 'type', {
	get: function() { return this._resource.type; },
});

ResourceView.prototype.field = function(name) {
	return _.find(this._fields, 'name', name);
};

ResourceView.prototype.select = function(names) {
	if (_.isString(names)) names = names.split(' ');
	var selected = getSelectedFields(this, names);
	return new ResourceView(this._resource, selected, this._sortBy);
	
	function getSelectedFields(self, names) {
		return _.filter(self._fields, function(field) {
			return _.contains(names, field.name);
		});
	}
};

ResourceView.prototype.sort = function(byFields) {
	return new ResourceView(this._resource, this._fields, byFields);
};

ResourceView.prototype._adjustQuery = function(query) {
	_.each(this._fields, function(field) {
		field.adjustQuery(query);
	});
};

ResourceView.prototype.find = function(filter, cb) {
	var query = this.model.find(filter);
	this._adjustQuery(query);
	if (!cb) return query;
	query.exec(cb);
};

ResourceView.prototype.findOne = function(filter, cb) {
	var query = this.model.findOne(filter);
	this._adjustQuery(query);
	if (!cb) return query;
	query.exec(cb);
};

ResourceView.prototype.serialize = function(object, response, cb) {
	var resdata = {};
	async.each(this._fields, function(field, cb) {
		field.serialize(object, response, function(err, value) {
			if (err) return cb(err);
			_.set(resdata, field.name, value);
			cb(null);
		});
	}, function(err) {
		err ? cb(err) : cb(null, resdata);
	});
};

ResourceView.prototype.deserialize = function(resdata, response, output, cb) {
	async.each(this._fields, function(field, cb) {
		var value = _.get(resdata, field.name);
		field.deserialize(value, response, output, cb);
	}, function(err) {
		err ? cb(err) : cb(null, output);
	});
};

module.exports = exports = ResourceView;
