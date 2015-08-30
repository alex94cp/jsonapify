var _ = require('lodash');

var Resource = require('./Resource');

function Registry() {
	this._resources = {};
}

Registry.prototype.get = function(name) {
	if (name) {
		return this._resources[name];
	} else {
		return _.keys(this._resources);
	}
}

Registry.prototype.add = function(name, resource) {
	if (!this._resources[name] && resource instanceof Resource) {
		this._resources[name] = resource;
	}
};

Registry.prototype.remove = function(name) {
	if (this._resources[name]) {
		delete this._resources[name];
	}
}
var instance;

function getInstance() {
	if (!instance) {
		instance = new Registry();
	}
	return instance;
}

module.exports = exports = getInstance();
