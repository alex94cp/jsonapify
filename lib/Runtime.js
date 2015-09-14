var Resource = require('./Resource');

function Runtime() {
	this._resources = {};
};

Runtime.prototype.addResource = function(name, resource) {
	if (!(resource instanceof Resource))
		throw new TypeError('resource must be of Resource type');
	if (!this._resources[name])
		this._resources[name] = resource;
};

Runtime.prototype.getResource = function(name) {
	return this._resources[name];
};

Runtime.prototype.removeResource = function(name) {
	if (this._resources[name])
		this._resources[name] = undefined;
};

module.exports = new Runtime;
