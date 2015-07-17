var _ = require('lodash');
var async = require('async');

function ResourceView(resource, selected, sortedBy) {
	if (resource instanceof ResourceView) {
		var resview = resource;
		resource = resview._resource;
		selected = resview._selected;
		sortedBy = resview._sortedBy;
	}
	
	selected = selected || [];
	sortedBy = sortedBy || [];
	
	this._resource = resource;
	this._selected = selected;
	this._sortedBy = sortedBy;
}

ResourceView.prototype.select = function(names) {
	if (_.isString(names)) names = names.split(' ');
	_.remove(this._selected, function(name) {
		return !_.contains(names, field.name);
	});
	return this;
};

ResourceView.prototype.sort = function(names) {
	var self = this;
	if (_.isString(names)) names = names.split(' ');
	_.each(sortedBy, function(name) {
		var order = 1;
		if (_.startsWith(name, '-')) {
			order = -1;
			name = name.slice(1);
		} else if (_.startsWith(name, '+')) {
			order = 1;
			name = name.slice(1);
		}
		var field = self._resource.field(name);
		self._sortedBy.push({ order: order, field: field });
	});
	return this;
};

Object.defineProperty(ResourceView.prototype, 'model', {
	get: function() { return this._resource.model; }
});

Object.defineProperty(ResourceView.prototype, 'type', {
	get: function() { return this._resource.type; },
});

ResourceView.prototype._adjustQuery = function(query) {
	_.each(this._selected, function(field) {
		field.adjustQuery(query, 'select');
	});
	_.each(this._sortedBy, function(opts) {
		var field = opts.field;
		var order = opts.order;
		field.adjustQuery(query, 'sort', order);
	})
};

ResourceView.prototype.find = function(filter, cb) {
	var query = this.model.find(filter);
	this._resource.emit('query', this);
	this._adjustQuery(query);
	if (!cb) return query;
	query.exec(cb);
};

ResourceView.prototype.findOne = function(filter, cb) {
	var query = this.model.findOne(filter);
	this._resource.emit('query', this);
	this._adjustQuery(query);
	if (!cb) return query;
	query.exec(cb);
};

ResourceView.prototype.field = function(name) {
	return _.find(this._selected, 'name', name);
};

ResourceView.prototype.serialize = function(object, response, cb) {
	var resdata = {};
	async.each(this._selected, function(field, cb) {
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
	async.each(this._selected, function(field, cb) {
		var value = _.get(resdata, field.name);
		field.deserialize(value, response, output, cb);
	}, function(err) {
		err ? cb(err) : cb(null, output);
	});
};

module.exports = exports = ResourceView;
