var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var jsonapify = require('../../');
var ApiError = jsonapify.errors.HttpError;
var UnknownError = jsonapify.errors.UnknownError;
var errorHandler = jsonapify.middleware.errorHandler;

describe('errorHandler', function() {
	var req, res, next;
	beforeEach(function() {
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();
		next = sinon.spy();
	});
	
	it('sends errors in response', function() {
		var err = new Error;
		errorHandler()(err, req, res, next);
		var resdata = res._getData();
		resdata = JSON.parse(resdata);
		expect(resdata).to.have.property('errors').with.length(1);
	});
});
