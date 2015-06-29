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
	if (_.isUndefined(value)) {
		return this._meta[name];
	} else {
		this._meta[name] = value;
		return this;
	}
};

Response.prototype.link = function(name, value) {
	if (_.isUndefined(value)) {
		return this._links[name];
	} else {
		this._links[name] = value;
		return this;
	}
};

Response.prototype.error = function(err) {
	this._errors.push(err);
	return this;
};

Response.prototype.data = function(data) {
	if (_.isUndefined(data)) {
		return this._data;
	} else {
		this._data = data;
		return this;
	}
};

Response.prototype.include = function(data) {
	this._included.push(data);
	return this;
};

Response.prototype.toJSON = function() {
	var object = {};
	if (!_.isEmpty(this._meta)) object.meta = this._meta;
	if (!_.isEmpty(this._links)) object.links = this._links;
	if (!_.isEmpty(this._errors)) object.errors = this._errors;
	if (!_.isEmpty(this._included)) object.included = this._included;
	if (!_.isUndefined(this._data)) object.data = this._data;
	object.jsonapi = JSONAPI;
	return object;
};

module.exports = exports = Response;
exports.create = createResponse;
