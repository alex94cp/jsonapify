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

Response.prototype.include = function(type, id, data) {
	var header = { type: type, id: id };
	var include = _.find(this._included, header);
	if (_.isUndefined(data)) {
		return include;
	} else {
		if (_.isUndefined(include)) {
			include = _.assign({}, header, data);
			this._included.push(include);
		} else {
			_.assign(include, data);
		}
		return this;
	}
}

Response.prototype.toJSON = function() {
	var object = {};
	if (!_.isEmpty(this._meta)) object.meta = this._meta;
	if (!_.isEmpty(this._links)) object.links = this._links;
	if (!_.isEmpty(this._errors)) object.errors = this._errors;
	if (!_.isUndefined(this._data)) object.data = this._data;
	if (!_.isEmpty(this._included)) object.included = this._included;
	object.jsonapi = JSONAPI;
	return object;
};

module.exports = exports = Response;
exports.create = createResponse;
