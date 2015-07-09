var _ = require('lodash');
var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var jsonapify = require('../');
var Resource = require('../lib/resource');

describe('update', function() {
	var testModel, resource;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			testModel = require('./testModel');
			resource = new Resource(testModel, {
				type: 'testmodels',
				id: {
					value: jsonapify.property('_id'),
					writable: false,
				},
				links: {
					self: {
						value: jsonapify.template('/testmodels/{_id}'),
						writable: false,
					},
				},
				attributes: {
					field: jsonapify.property('string'),
				},
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
		testModel.create({ string: 'foo' }, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				params: {
					id: object._id,
				},
				body: {
					data: {
						type: 'testmodels',
						attributes: {
							field: 'bar',
						},
					},
				},
			});
			var res = httpMocks.createResponse();
			jsonapify.update(
				resource, jsonapify.param('id')
			)(req, res, function(err) {
				if (err) return done(err);
				var expected = req.body.data;
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				expect(resdata.data).to.have.property('id');
				expect(resdata.data).to.have.property('type', expected.type);
				expect(resdata.data.id).to.satisfy(function(id) {
					return object._id.equals(id);
				});
				var expectedField = expected.attributes.field;
				expect(resdata.data).to.have.deep.property('attributes.field', expectedField);
				done();
			});
		});
	});
	
	it('allows a subresource to be specified', function(done) {
		testModel.create({ string: 'foo' }, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				params: {
					id: object._id,
				},
				body: {
					data: {
						type: 'testmodels',
						attributes: {
							field: 'bar',
						},
					},
				},
			});
			var res = httpMocks.createResponse();
			jsonapify.update(
				resource, jsonapify.param('id'),
				resource, { string: jsonapify.parent('string') }
			)(req, res, function(err) {
				if (err) return done(err);
				var expected = req.body.data;
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				expect(resdata.data).to.have.property('id');
				expect(resdata.data).to.have.property('type', expected.type);
				expect(resdata.data.id).to.satisfy(function(id) {
					return object._id.equals(id);
				});
				var expectedField = expected.attributes.field;
				expect(resdata.data).to.have.deep.property('attributes.field', expectedField);
				done();
			});
		});
	});
	
	it('sends null if resource not found', function(done) {
		var req = httpMocks.createRequest({
			params: {
				id: mongoose.Types.ObjectId(),
			},
			body: {
				data: {
					type: 'testmodels',
					attributes: {
						field: 'bar',
					},
				},
			},
		});
		var res = httpMocks.createResponse();
		jsonapify.update(resource, jsonapify.param('id'))(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(404);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data', null);
			done();
		});
	});
});
