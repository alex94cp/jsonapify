var _ = require('lodash');
var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');

var jsonapify = require('../');
var errors = require('../lib/errors');
var Resource = require('../lib/resource');

describe('delete', function() {
	var testModel, resource;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			testModel = require('./testModel');
			resource = new Resource(testModel, {
				type: 'test-models',
				id: jsonapify.property('_id'),
			});
			done();
		});
	});
	
	beforeEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('deletes resource and sends back expected response', function(done) {
		testModel.create({}, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accept': 'application/vnd.api+json',
				},
				params: {
					id: object._id,
				},
			});
			var res = httpMocks.createResponse();
			jsonapify.delete(resource, jsonapify.param('id'))(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(204);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data', null);
				testModel.findById(object._id, function(err, result) {
					if (err) return done(err);
					expect(result).to.not.exist;
					done();
				});
			});
		});
	});
	
	it('deletes subresource and sends back expected response', function(done) {
		testModel.create({ string: 'foo' }, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accept': 'application/vnd.api+json',
				},
				params: {
					id: object._id,
				},
			});
			var res = httpMocks.createResponse();
			jsonapify.delete(
				resource, jsonapify.param('id'),
				resource, { string: jsonapify.parent('string') }
			)(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(204);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data', null);
				testModel.findById(object._id, function(err, result) {
					if (err) return done(err);
					expect(result).to.not.exist;
					done();
				});
			});
		});
	});
	
	it('gives ResourceNotFound error if resource not found', function(done) {
		var req = httpMocks.createRequest({
			headers: {
				'Content-Type': 'application/vnd.api+json',
				'Accept': 'application/vnd.api+json',
			},
			params: {
				id: mongoose.Types.ObjectId(),
			},
		});
		var res = httpMocks.createResponse();
		jsonapify.delete(resource, jsonapify.param('id'))(req, res, function(err) {
			expect(err).to.exist.and.be.an.instanceof(errors.ResourceNotFound);
			done();
		});
	});
});
