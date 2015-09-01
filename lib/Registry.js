var Resource = require('./Resource');

function Registry() {
	this._resources = {};
}

Registry.prototype.get = function(name) {
	return this._resources[name];
};

Registry.prototype.add = function(name, resource) {
	if (!(resource instanceof Resource))
		throw new TypeError('resource object must have Resource type');
	if (!this._resources[name])
		this._resources[name] = resource;
};

Registry.prototype.remove = function(name) {
	if (this._resources[name])
		this._resources[name] = undefined;
};

module.exports = new Registry;
