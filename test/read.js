var _ = require('lodash');
var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var jsonapify = require('../');
var Resource = require('../lib/resource');

describe('read', function() {
	var TestModel, resource;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			TestModel = require('./testModel');
			resource = new Resource(TestModel, {
				type: 'testmodels',
				id: jsonapify.property('_id'),
			});
			done();
		});
	});
	
	beforeEach(function(done) {
		// mockgoose.reset();
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('sends back expected json-api response', function(done) {
		TestModel.create({}, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({ params: { id: object._id }});
			var res = httpMocks.createResponse();
			jsonapify.read(resource, jsonapify.param('id'))(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				expect(resdata.data).to.have.property('id');
				expect(resdata.data).to.have.property('type', 'testmodels');
				expect(resdata.data.id).to.satisfy(function(id) {
					return object._id.equals(id);
				});
				done();
			});
		});
	});
	
	it('allows a subresource to be specified', function(done) {
		TestModel.create({ string: 'foo' }, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({ params: { id: object._id }});
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
				expect(resdata.data).to.have.property('type', 'testmodels');
				expect(resdata.data.id).to.satisfy(function(id) {
					return object._id.equals(id);
				});
				done();
			});
		});
	});
	
	it('sends null if resource not found', function(done) {
		var oid = mongoose.Types.ObjectId();
		var req = httpMocks.createRequest({ params: { id: oid }});
		var res = httpMocks.createResponse();
		jsonapify.read(resource, jsonapify.param('id'))(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(404);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data', null);
			done();
		});
	});
});
