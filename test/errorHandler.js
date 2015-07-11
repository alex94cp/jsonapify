var chai = require('chai');
var sinon = require('sinon');
var httpMocks = require('node-mocks-http');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var jsonapify = require('../');
var Response = require('../lib/response');

describe('errorHandler', function() {
	it('intercepts errors and includes them in response', function() {
		var expected = {
			status: 500,
			detail: 'Error message',
			description: 'Unknown Error',
		};
		var err = new Error(expected.detail);
		var req = httpMocks.createRequest();
		var res = httpMocks.createResponse();
		var next = sinon.spy();
		jsonapify.errorHandler()(err, req, res, next);
		expect(next).to.not.have.been.called;
		var resdata = JSON.parse(res._getData());
		expect(resdata).to.not.have.property('data');
		expect(resdata).to.have.property('errors').with.length(1);
		expect(resdata.errors[0]).to.include(expected);
	});
});
