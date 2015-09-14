var util = require('util');

var Runtime = require('./Runtime');

function Registry() {}

Registry.prototype.add = util.deprecate(function(name, resource) {
	return Runtime.addResource(name, resource);
}, [
	'Registry#add has been deprecated and will soon be removed. ',
	'Consider using Runtime#addResource instead.',
].join(''));

Registry.prototype.get = util.deprecate(function(name) {
	return Runtime.getResource(name);
}, [
	'Registry#get has been deprecated and will soon be removed. ',
	'Consider using Runtime#getResource instead.',
].join(''));

Registry.prototype.remove = util.deprecate(function(name) {
	Runtime.removeResource(name);
}, [
	'Registry#remove has been deprecated and will soon be removed. ',
	'Consider using Runtime#removeResource instead.',
].join(''));

module.exports = new Registry;
