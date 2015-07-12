var _ = require('lodash');

var JSONAPI = {
	version: '1.0',
};

function Response(res) {
	this._res = res;
	this._meta = {};
	this._links = {};
	this._errors = [];
	this._included = [];
}

function createResponse(res) {
	return new Response(res);
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

Response.prototype.toJSON = function() {
	var object = {};
	setIfNotEmpty(object, 'meta', this._meta);
	setIfNotEmpty(object, 'links', this._links);
	setIfNotEmpty(object, 'errors', this._errors);
	if (_.isEmpty(this._errors) && !_.isUndefined(this._data))
		object.data = this._data;
	setIfNotEmpty(object, 'included', this._included);
	object.jsonapi = JSONAPI;
	return object;
	
	function setIfNotEmpty(object, path, value) {
		if (!_.isEmpty(value))
			_.set(object, path, value);
	}
};

Response.prototype.status = function(code) {
	switch(arguments.length) {
	case 0:
		return this._res.statusCode;
	case 1:
		this._res.status(code);
		return this;
	}
};

Response.prototype.header = function(name, value) {
	switch(arguments.length) {
	case 1:
		return this._res.get(name);
	case 2:
		this._res.set(name, value);
		return this;
	}
}

Response.prototype.send = function() {
	var self = this;
	this._res.contentType('application/vnd.api+json');
	if (!_.isEmpty(this._errors)) handleErrors();
	this._res.json(this);
	
	function handleErrors() {
		var codes = _.pluck(self._errors, 'status');
		var errCode = aproximateErrorCode(codes);
		self.status(errCode);
	}
	
	function aproximateErrorCode(codes) {
		var status = _.first(codes);
		if (codes.length > 1)
			status = genericErrorCode(status);
		return status;
	}
	
	function genericErrorCode(code) {
		return Math.ceil(code / 100) * 100;
	}
}

module.exports = exports = Response;
exports.create = createResponse;
