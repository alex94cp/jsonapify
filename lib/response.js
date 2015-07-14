var _ = require('lodash');
var mongoose = require('mongoose');

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
	if (_.isUndefined(value)) {
		if (_.isUndefined(name)) {
			return this._meta;
		} else {
			if (_.isString(name)) {
				return this._meta[name];
			} else {
				var meta = name;
				this._meta = meta;
				return this;
			}
		}
	} else {
		this._meta[name] = value;
		return this;
	}
};

Response.prototype.links = function(links) {
	if (_.isUndefined(links)) {
		return this._links;
	} else {
		this._links = links;
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

Response.prototype.errors = function(errors) {
	if (_.isUndefined(errors)) {
		return this._errors;
	} else {
		this._errors = errors;
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

Response.prototype.includes = function(includes) {
	if (_.isUndefined(includes)) {
		return this._included;
	} else {
		this._included = includes;
		return this;
	}
};

Response.prototype.include = function(type, id, data) {
	var header = { type: type, id: toObjectId(id) };
	var include = findInclude(this);
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
	
	function toObjectId(id) {
		return mongoose.Types.ObjectId(id);
	}
	
	function findInclude(self) {
		return _.find(self._included, function(inc) {
			return inc.type === type && inc.id.equals(id);
		});
	}
}

Response.prototype.status = function(code) {
	if (_.isUndefined(code)) {
		return this._res.statusCode;
	} else {
		this._res.status(code);
		return this;
	}
};

Response.prototype.header = function(name, value) {
	if (_.isUndefined(value)) {
		return this._res.get(name);
	} else {
		this._res.set(name, value);
		return this;
	}
};

Response.prototype.toJSON = function() {
	var object = {};
	setIfNotEmpty(object, 'meta', this._meta);
	setIfNotEmpty(object, 'links', this._links);
	setIfNotEmpty(object, 'errors', this._errors);
	if (_.isEmpty(this._errors) && !_.isUndefined(this._data))
		object.data = this._data;
	setIfNotEmpty(object, 'included', this._included);
	object.jsonapi = { version: '1.0' };
	return object;
	
	function setIfNotEmpty(object, path, value) {
		if (!_.isEmpty(value))
			_.set(object, path, value);
	}
};

Response.prototype.send = function() {
	this._res.contentType('application/vnd.api+json');
	if (!_.isEmpty(this._errors)) handleErrors(this);
	this._res.json(this);
	
	function handleErrors(self) {
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
