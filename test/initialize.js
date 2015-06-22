var expect = require('chai').expect;
var httpMocks = require('node-mocks-http');
var jsonapify = require('../');

var util = require('util');

describe('initialize', function() {
	var initialize, req, res;
	before(function() {
		console.log('FOO');
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
			expect(res).to.have.property('setLink');
			expect(res).to.have.property('setMeta');
			expect(res).to.have.property('sendData');
			expect(res).to.have.property('sendError');
			done();
		});
	});
	
	describe('#sendError', function() {
		it('sends error in json-api compatible format', function(done) {
			initialize(req, res, function(err) {
				if (err) return done(err);
				res.sendError({
					
				});
				done();
			});
		});
	});
	
	describe('#sendData', function() {
		it('sends data in json-api compatible format', function(done) {
			initialize(req, res, function(err) {
				if (err) return done(err);
				res.sendData({
					
				});
				done();
			});
		});
	});
});
