var expect = require('chai').expect;
var httpMocks = require('node-mocks-http');
var jsonapify = require('../');

describe('initialize', function() {
	var initialize, req, res;
	before(function() {
		initialize = jsonapify.initialize();
	});
	
	beforeEach(function() {
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();
		initialize(req, res, function(err) {
			expect(err).to.not.exist;
		});
	});
	
	it('adds json-api utilities to response object', function() {
		expect(res).to.have.property('meta');
		expect(res).to.have.property('links');
		expect(res).to.have.property('errors');
		expect(res).to.have.property('setLink');
		expect(res).to.have.property('setMeta');
		expect(res).to.have.property('sendData');
		expect(res).to.have.property('sendError');
	});
	
	describe('#setLink', function() {
		var linkName = 'foo', linkValue = 'http://foobar.com';
		beforeEach(function() {
			res.setLink(linkName, linkValue);
		});
		
		it('sets link to value in response links object', function() {
			expect(res.links).to.have.property(linkName, linkValue);
		});
		
		it('includes link in json-api response links object', function() {
			res.sendData();
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('links');
			expect(resdata.links).to.have.property(linkName, linkValue);
		});
	});
	
	describe('#setMeta', function() {
		var metaName = 'foo', metaValue = 'bar';
		beforeEach(function() {
			res.setMeta(metaName, metaValue);
		});
		
		it('sets name to value in response meta object', function() {
			expect(res.meta).to.have.property(metaName, metaValue);
		});
		
		it('includes meta in json-api response meta object', function() {
			res.sendData();
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('meta');
			expect(resdata.meta).to.have.property(metaName, metaValue);
		})
	});
	
	describe('#sendError', function() {
		beforeEach(function() {
			res.sendError('this is an error');
		});
		
		it('adds error to response object', function() {
			expect(res.errors).to.have.property('length', 1);
		});
		
		it('includes error in json-api response errors object', function() {
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('jsonapi');
			expect(resdata).to.have.property('errors');
			expect(resdata).to.not.have.property('data');
		});
	});
	
	describe('#sendData', function() {
		it('includes data in json-api response data object', function() {
			res.sendData(null);
			expect(res.data).to.equal(null);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('jsonapi');
			expect(resdata).to.have.property('data', null);
			expect(resdata).to.not.have.property('errors');
		});
	});
});
