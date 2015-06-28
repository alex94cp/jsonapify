var _ = require('lodash');

function RelatedAccessor(resource, template) {
	if (!(this instanceof RelatedAccessor))
		return new RelatedAccessor(resource);
	
	this._resource = resource;
	this._template = template;
}

function createRelated(resource, template) {
	return new RelatedAccessor(resource, template);
}

RelatedAccessor.prototype.get = function(object) {
	
};

RelatedAccessor.prototype.set = function(object, value) {
	
};

module.exports = exports = RelatedAccessor;
exports.create = createRelated;
