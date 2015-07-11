var _ = require('lodash');

var JSONAPI = {
	version: '1.0',
};

function Response() {
	this._meta = {};
	this._links = {};
	this._errors = [];
	this._included = [];
}

function createResponse() {
	return new Response;
}

Response.prototype.meta = function(name, value) {
	switch (arguments.length) {
	case 0:
		return this._meta;
	case 1:
		if (_.isString(name)) {
			return this._meta[name];
		} else {
			var meta = name;
			this._meta = meta;
			return this;
		}
	case 2:
		this._meta[name] = value;
		return this;
	}
};

Response.prototype.links = function(links) {
	switch (arguments.length) {
	case 0:
		return this._links;
	case 1:
		this._links = links;
		return this;
	}
};

Response.prototype.link = function(name, value) {
	switch (arguments.length) {
	case 1:
		return this._links[name];
	case 2:
		this._links[name] = value;
		return this;
	}
};

Response.prototype.errors = function(errors) {
	switch (arguments.length) {
	case 0:
		return this._errors;
	case 1:
		this._errors = errors;
		return this;
	}
};

Response.prototype.error = function(err) {
	this._errors.push(err);
	return this;
};

Response.prototype.data = function(data) {
	switch (arguments.length) {
	case 0:
		return this._data;
	case 1:
		this._data = data;
		return this;
	}
};

Response.prototype.includes = function(includes) {
	switch (arguments.length) {
	case 0:
		return this._included;
	case 1:
		this._included = includes;
		return this;
	}
};

Response.prototype.include = function(type, id, data) {
	var header = { type: type, id: id };
	var include = _.find(this._included, header);
	switch (arguments.length) {
	case 2:
		return include;
	case 3:
		if (_.isUndefined(include)) {
			include = _.assign({}, header, data);
			this._included.push(include);
		} else {
			_.assign(include, data);
		}
		return this;
	}
}

function setIfNotEmpty(object, path, value) {
	if (!_.isEmpty(value))
		_.set(object, path, value);
}

Response.prototype.toJSON = function() {
	var object = {};
	object.jsonapi = JSONAPI;
	setIfNotEmpty(object, 'meta', this._meta);
	setIfNotEmpty(object, 'links', this._links);
	setIfNotEmpty(object, 'errors', this._errors);
	setIfNotEmpty(object, 'included', this._included);
	if (_.isEmpty(this._errors) && !_.isUndefined(this._data))
		object.data = this._data;
	return object;
};

module.exports = exports = Response;
exports.create = createResponse;
