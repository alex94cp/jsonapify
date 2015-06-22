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
	});
	
	it('adds json-api utilities to response object', function(done) {
		initialize(req, res, function(err) {
			if (err) return done(err);
			expect(res).to.have.property('meta');
			expect(res).to.have.property('links');
			expect(res).to.have.property('errors');
			expect(res).to.have.property('sendData');
			expect(res).to.have.property('sendError');
			done();
		});
	});
	
	describe('#sendError', function(done) {
		initialize(req, res, function(err) {
			if (err) return done(err);
			res.sendError({
				
			});
			done();
		});
	});
	
	describe('#sendData', function(done) {
		initialize(req, res, function(err) {
			if (err) return done(err);
			res.sendData({
				
			});
			done();
		});
	});
});
