var _ = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

function Response(res) {
	this._res = res;
	this._meta = {};
	this._links = {};
	this._errors = [];
	this._included = [];
}

Object.defineProperty(Response.prototype, 'raw', {
	get: function() { return this._res; },
});

Object.defineProperty(Response.prototype, 'meta', {
	get: function() { return this._meta; },
});

Object.defineProperty(Response.prototype, 'links', {
	get: function() { return this._links; },
});

Object.defineProperty(Response.prototype, 'errors', {
	get: function() { return this._errors; },
});

Response.prototype.error = function(err) {
	this._errors.push(err);
	return this;
};

Object.defineProperty(Response.prototype, 'included', {
	get: function() { return this._included; },
});

Response.prototype.include = function(type, id, data) {
	var include = _.find(this._included, function(include) {
		return include.type === type && include.id.equals(id);
	});
	if (!data) return include;
	if (!include) {
		include = {};
		this._included.push(include);
	}
	_.assign(include, data, { type: type, id: new ObjectId(id) });
	return this;
};

Object.defineProperty(Response.prototype, 'data', {
	get: function() { return this._data; },
	set: function(data) { this._data = data; },
});

Response.prototype.toJSON = function() {
	var object = {};
	object.meta = this._meta;
	object.links = this._links;
	object.errors = this._errors;
	if (!_.isUndefined(this._data) && _.isEmpty(this._errors))
		object.data = this._data;
	object.included = this._included;
	object.jsonapi = { version: '1.0' };
	return _.omit(object, _.isEmpty);
};


Response.prototype.send = function(data) {
	var res = this._res;
	res.contentType('application/vnd.api+json');
	if (!_.isEmpty(this._errors))
		res.statusCode = aproximateErrorCode(this._errors);
	if (!_.isUndefined(data)) this._data = data;
	res.json(this);
};

function aproximateErrorCode(errors) {
	return _(errors).pluck('status').reduce(function(status, errCode) {
		if (errCode === status) return status;
		var prev = genericErrorCode(status);
		var next = genericErrorCode(errCode);
		return Math.max(prev, next);
	});
}

function genericErrorCode(status) {
	return status - status % 100;
}

module.exports = Response;
