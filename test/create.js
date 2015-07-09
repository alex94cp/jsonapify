var _ = require('lodash');
var util = require('util');
var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var jsonapify = require('../');
var Resource = require('../lib/resource');

describe('create', function() {
	var TestModel, resource;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test-create', function(err) {
			if (err) return done(err);
			TestModel = require('./testModel');
			resource = new Resource(TestModel, {
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
	
	beforeEach(function() {
		// mockgoose.reset();
		mongoose.connection.db.dropDatabase();
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('sends back created resource info', function(done) {
		var req = httpMocks.createRequest({
			body: {
				data: {
					type: 'testmodels',
					attributes: {
						field: 'foo',
					},
				},
			},
		});
		var res = httpMocks.createResponse();
		jsonapify.create(resource)(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(201);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data');
			expect(resdata.data).to.have.property('id');
			expect(resdata.data.id).to.satisfy(function(id) {
				return mongoose.Types.ObjectId.isValid(id);
			});
			var expected = req.body.data;
			expect(resdata.data).to.have.property('type', expected.type);
			expect(resdata.data).to.have.deep.property('attributes.field', expected.attributes.field);
			var selfUrl = util.format('/testmodels/%s', resdata.data.id);
			expect(resdata.data).to.have.deep.property('links.self', selfUrl);
			expect(res.get('Location')).to.equal(selfUrl);
			TestModel.findById(resdata.data.id, function(err, object) {
				if (err) return done(err);
				expect(object).to.exist;
				expect(object).to.have.property('string', expected.attributes.field);
				done();
			});
		});
	});
	
	it('allows a subresource to be specified', function(done) {
		TestModel.create({ number: 1234 }, function(err, parent) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				params: {
					id: parent._id,
				},
				body: {
					data: {
						type: 'testmodels',
						attributes: {
							field: 'foo',
						},
					},
				},
			});
			var res = httpMocks.createResponse();
			jsonapify.create(
				resource, jsonapify.param('id'),
				resource, { number: jsonapify.parent('number') }
			)(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(201);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				expect(resdata.data).to.have.property('id');
				expect(resdata.data.id).to.satisfy(function(id) {
					return mongoose.Types.ObjectId.isValid(id);
				});
				var expected = req.body.data;
				expect(resdata.data).to.have.property('type', expected.type);
				expect(resdata.data).to.have.deep.property('attributes.field', expected.attributes.field);
				var selfUrl = util.format('/testmodels/%s', resdata.data.id);
				expect(resdata.data).to.have.deep.property('links.self', selfUrl);
				expect(res.get('Location')).to.equal(selfUrl);
				TestModel.findById(resdata.data.id, function(err, object) {
					if (err) return done(err);
					expect(object).to.exist;
					expect(object).to.have.property('number', parent.number);
					done();
				});
			});
		});
	});
	
	it('sends back a 202 Accepted HTTP response if noWait is set', function(done) {
		var req = httpMocks.createRequest({
			body: {
				data: {
					type: 'testmodels',
					attributes: {
						field: 'foo',
					},
				},
			},
		});
		var res = httpMocks.createResponse();
		jsonapify.create(resource, { noWait: true })(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(202);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data', null);
			done();
		});
	});
});
