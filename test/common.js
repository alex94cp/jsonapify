var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var Accessor = require('../lib/Accessor');
var Response = require('../lib/Response');
var Transaction = require('../lib/Transaction');

function createAccessor() {
	var accessor = new Accessor;
	sinon.stub(accessor, 'serialize');
	sinon.stub(accessor, 'deserialize');
	sinon.stub(accessor, 'accessProperty');
	return accessor;
}

function initAccessor(accessor, value, object, property) {
	accessor.serialize.callsArgWithAsync(3, null, value);
	accessor.deserialize.callsArgWithAsync(4, null, object);
	accessor.accessProperty.callsArgWithAsync(0, property);
}

function createTransaction(resource) {
	var res = httpMocks.createResponse();
	var response = new Response(res);
	return new Transaction(resource, response);
}

exports.createAccessor = createAccessor;
exports.initAccessor = initAccessor;
exports.createTransaction = createTransaction;
