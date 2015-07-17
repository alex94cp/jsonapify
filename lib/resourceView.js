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
	names = parseSelectFields(names);
	this._selected = _.filter(this._selected, fieldNameIn(names));
	return this;
	
	function parseSelectFields(names) {
		if (_.isString(names)) names = names.split(' ');
		return _(names).filter(isNotDeselectField)
		               .map(removeFieldPrefix)
		               .value();
	}
	
	function isNotDeselectField(name) {
		return !_.startsWith(name, '-');
	}
	
	function removeFieldPrefix(name) {
		return _.startsWith(name, '+') ? name.slice(1) : name;
	}
	
	function fieldNameIn(names) {
		return function(field) {
			return _.contains(names, field.name);
		};
	}
};

ResourceView.prototype.sort = function(names) {
	var sortedBy = this._sortedBy;
	names = parseSortFields(names);
	sortedBy.push.apply(sortedBy, names);
	return this;
	
	function parseSortFields(names) {
		if (_.isString(names)) names = names.split(' ');
		return _.map(names, parseSortFieldString);
	}
	
	function parseSortFieldString(name) {
		if (_.startsWith(name, '-')) {
			return { order: -1, name: _.slice(name, 1) };
		} else if (_.startsWith(name, '+')) {
			return { order: 1, name: _.slice(name, 1) };
		} else {
			return { order: 1, name: name };
		}
	}
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
