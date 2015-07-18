var _ = require('lodash');
var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');

var jsonapify = require('../');
var errors = require('../lib/errors');
var Resource = require('../lib/resource');

describe('read', function() {
	var TestModel, resource;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			TestModel = require('./testModel');
			resource = new Resource(TestModel, {
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
	
	it('sends back resource info', function(done) {
		TestModel.create({}, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accept': 'application/vnd.api+json',
				},
				params: {
					id: object._id
				},
			});
			var res = httpMocks.createResponse();
			jsonapify.read(resource, jsonapify.param('id'))(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				expect(resdata.data).to.have.property('id');
				expect(resdata.data).to.have.property('type', 'test-models');
				expect(resdata.data.id).to.satisfy(function(id) {
					return object._id.equals(id);
				});
				done();
			});
		});
	});
	
	it('sends back subresource info', function(done) {
		TestModel.create({ string: 'foo' }, function(err, object) {
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
			jsonapify.read(
				resource, jsonapify.param('id'),
				resource, { string: jsonapify.parent('string') }
			)(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				expect(resdata.data).to.have.property('id');
				expect(resdata.data).to.have.property('type', 'test-models');
				expect(resdata.data.id).to.satisfy(function(id) {
					return object._id.equals(id);
				});
				done();
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
		jsonapify.read(resource, jsonapify.param('id'))(req, res, function(err) {
			expect(err).to.exist.and.be.an.instanceof(errors.ResourceNotFound);
			done();
		});
	});
});
