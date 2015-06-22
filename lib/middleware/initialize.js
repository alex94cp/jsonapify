var _ = require('lodash');

var JSONAPI = {
	version: '1.0',
};

function isValidJsonApiLink(object) {
	if (_.isString(object))
		return true;
	if (_.isPlainObject(object))
		return _.isString(object.href);
	return false;
}

function isValidJsonApiResource(object) {
	if (!_.isPlainObject(object))
		return false;
	if (!_.isString(object.id))
		return false;
	if (!_.isString(object.type))
		return false;
	return true;
}

function isValidJsonApiData(object) {
	if (object === null)
		return true;
	if (_.isString(object))
		return true;
	if (_.isArray(object))
		return _.every(object, isValidJsonApiResource);
	if (_.isPlainObject(object))
		return isValidJsonApiResource(object);
	return false;
}

function jsonResponseSetMeta(name, value) {
	this.meta[name] = value;
}

function jsonResponseSetLink(name, value) {
	if (!isValidJsonApiLink(value))
		throw new TypeError('invalid link object');
	this.links[name] = value;
}

function filterUndefined(object) {
	return _.omit(object, _.isUndefined);
}

function jsonResponseSendRaw() {
	this.set('Content-Type', 'application/vnd.api+json');
	
	var data = filterUndefined(this.data);
	var meta = filterUndefined(this.meta);
	var links = filterUndefined(this.links);
	var errors = filterUndefined(this.errors);
	var included = filterUndefined(this.included);
	
	if (_.isEmpty(data) && !_.isEmpty(included))
		throw new TypeError('invalid json-api format');
	
	var responseRaw = {};
	if (!_.isEmpty(data)) responseRaw.data = data;
	if (!_.isEmpty(meta)) responseRaw.meta = meta;
	if (!_.isEmpty(links)) responseRaw.links = links;
	if (!_.isEmpty(errors)) responseRaw.errors = errors;
	if (!_.isEmpty(included)) responseRaw.included = included;
	
	responseRaw.jsonapi = JSONAPI;
	this.json(responseRaw);
}

function jsonResponseSendError(err) {
	this.errors.append(err);
	jsonResponseSendRaw();
}

function jsonResponseSendData(data) {
	if (!isValidJsonApiData(data))
		throw new TypeError('invalid data object');
	this.data = data;
	jsonResponseSendRaw();
}

function jsonResponseInit(res) {
	res.meta = {};
	res.links = {};
	res.errors = [];
	res.included = [];
	
	res.setLink = jsonResponseSetLink;
	res.setMeta = jsonResponseSetMeta;
	res.sendData = jsonResponseSendData;
	res.sendError = jsonResponseSendError;
}

function initialize(opts) {
	function middleware(req, res, next) {
		jsonResponseInit(res);
		next();
	}
	
	return middleware;
}

module.exports = initialize;
