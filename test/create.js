var _ = require('lodash');
var util = require('util');
var chai = require('chai');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');

var jsonapify = require('../');
var Resource = require('../lib/resource');

describe('create', function() {
	var testModel, resource, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			testModel = require('./testModel');
			resource = new Resource(testModel, {
				type: 'test-models',
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
		res = httpMocks.createResponse();
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('creates resource and sends back resource info', function(done) {
		var req = httpMocks.createRequest({
			headers: {
				'Content-Type': 'application/vnd.api+json',
				'Accept': 'application/vnd.api+json',
			},
			body: {
				data: {
					type: 'test-models',
					attributes: {
						field: 'foo',
					},
				},
			},
		});
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
			testModel.findById(resdata.data.id, function(err, object) {
				if (err) return done(err);
				expect(object).to.exist;
				expect(object).to.have.property('string', expected.attributes.field);
				done();
			});
		});
	});
	
	it('sets Location HTTP header if resource has self link', function(done) {
		var req = httpMocks.createRequest({
			headers: {
				'Content-Type': 'application/vnd.api+json',
				'Accept': 'application/vnd.api+json',
			},
			body: {
				data: {
					type: 'test-models',
					attributes: {
						field: 'foo',
					},
				},
			},
		});
		jsonapify.create(resource)(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(201);
			var resdata = JSON.parse(res._getData());
			var selfUrl = util.format('/testmodels/%s', resdata.data.id);
			expect(resdata.data).to.have.deep.property('links.self', selfUrl);
			expect(res.get('Location')).to.equal(selfUrl);
			done();
		});
	});
	
	it('creates a subresource and sends back resource info', function(done) {
		testModel.create({ number: 1234 }, function(err, parent) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accept': 'application/vnd.api+json',
				},
				body: {
					data: {
						type: 'test-models',
						attributes: {
							field: 'foo',
						},
					},
				},
				params: {
					id: parent._id,
				},
			});
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
				testModel.findById(resdata.data.id, function(err, object) {
					if (err) return done(err);
					expect(object).to.exist;
					expect(object).to.have.property('number', parent.number);
					done();
				});
			});
		});
	});
	
	it('creates resource and sends back 202 Accepted if noWait is set', function(done) {
		var req = httpMocks.createRequest({
			headers: {
				'Content-Type': 'application/vnd.api+json',
				'Accept': 'application/vnd.api+json',
			},
			body: {
				data: {
					type: 'test-models',
					attributes: {
						field: 'foo',
					},
				},
			},
		});
		jsonapify.create(resource, { noWait: true })(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(202);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data', null);
			done();
		});
	});
});
