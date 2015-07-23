var util = require('util');

var _ = require('lodash');

function Transaction(resource, response) {
	this._resource = resource;
	this._response = response;
	this._handlers = {};
}

Object.defineProperty(Transaction.prototype, 'resource', {
	get: function() { return this._resource; },
});

Object.defineProperty(Transaction.prototype, 'response', {
	get: function() { return this._response; },
});

Transaction.prototype.subscribe = function(type, what, handler) {
	var key = util.format('%s.%s', type, what);
	var handlers = this._handlers[key];
	if (handlers) {
		handlers.push(handler);
	} else {
		handlers = [handler];
		this._handlers[key] = handlers;
	}
};

Transaction.prototype.unsubscribe = function(type, what, handler) {
	var key = util.format('%s.%s', type, what);
	var handlers = this._handlers[key];
	if (!handlers) return;
	_.remove(handlers, _.partial(_.eq, handler));
	if (_.isEmpty(handlers)) this._handlers[key] = undefined;
};

Transaction.prototype.notify = function(resource, what) {
	var params = _.slice(arguments, 2);
	var key = util.format('%s.%s', resource.type, what);
	var handlers = this._handlers[key];
	if (!handlers) return false;
	var args = [resource].concat(params);
	_.each(handlers, function(handler) {
		handler.apply(null, args);
	});
	return true;
};

Transaction.prototype.transform = function(resource, what) {
	var params = _.slice(arguments, 2);
	var value = params.pop();
	var key = util.format('%s.%s', resource.type, what);
	var handlers = this._handlers[key];
	if (!handlers) return value;
	var args = [resource].concat(params, value);
	return _.reduce(handlers, function(value, handler) {
		return handler.apply(null, args);
	}, value);
};

module.exports = Transaction;
