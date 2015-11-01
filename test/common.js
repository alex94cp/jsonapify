var sinon = require('sinon');
var httpMocks = require('node-mocks-http');

var Accessor = require('../lib/Accessor');
var Response = require('../lib/Response');
var Transaction = require('../lib/Transaction');

function createAccessor() {
	var accessor = new Accessor;
	sinon.stub(accessor, 'serialize');
	sinon.stub(accessor, 'deserialize');
	sinon.stub(accessor, 'visitProperties');
	return accessor;
}

function initAccessor(accessor, value, object, property) {
	accessor.serialize.callsArgWithAsync(3, null, value);
	accessor.deserialize.callsArgWithAsync(4, null, object);
	accessor.visitProperties.callsArgWithAsync(0, property);
}

function createTransaction(resource) {
	var res = httpMocks.createResponse();
	var response = new Response(res);
	return new Transaction(resource, response);
}

exports.initAccessor = initAccessor;
exports.createAccessor = createAccessor;
exports.createTransaction = createTransaction;
