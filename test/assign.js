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

describe('assign', function() {
	var testModel, resource, res;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			testModel = require('./testModel');
			resource = new Resource(testModel, {
				type: 'test-models',
				id: jsonapify.property('number'),
				links: {
					self: {
						value: jsonapify.template('/testmodels/{number}'),
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
	
	after(function() {
		mongoose.disconnect();
	});
	
	it('creates new resource and sends back resource info', function(done) {
		var req = httpMocks.createRequest({
			headers: {
				'Content-Type': 'application/vnd.api+json',
				'Accepts': 'application/vnd.api+json',
			},
			body: {
				data: {
					type: 'test-models',
					id: 1234,
					attributes: {
						field: 'value',
					},
				},
			},
			params: {
				id: 1234,
			},
		});
		jsonapify.assign(
			resource, { number: jsonapify.param('id') }
		)(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(201);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data');
			var expected = req.body.data;
			expect(resdata.data).to.have.property('id', expected.id);
			expect(resdata.data).to.have.property('type', expected.type);
			expect(resdata.data).to.have.deep.property('attributes.field', expected.attributes.field);
			var selfUrl = util.format('/testmodels/%s', resdata.data.id);
			expect(resdata.data).to.have.deep.property('links.self', selfUrl);
			testModel.findOne({ number: expected.id }, function(err, object) {
				if (err) return done(err);
				expect(object).to.exist;
				expect(object).to.have.property('string', expected.attributes.field);
				done();
			});
		});
	});
	
	it('creates resource and sends back 202 Accepted if noWait is set', function(done) {
		var req = httpMocks.createRequest({
			headers: {
				'Content-Type': 'application/vnd.api+json',
				'Accepts': 'application/vnd.api+json',
			},
			body: {
				data: {
					type: 'test-models',
					id: 1234,
					attributes: {
						field: 'value',
					},
				},
			},
			params: {
				id: 1234,
			},
		});
		jsonapify.assign(
			resource, { number: jsonapify.param('id') }, { noWait: true }
		)(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(202);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data', null);
			done();
		});
	});
	
	it('updates existing resource and sends back resource info', function(done) {
		testModel.create({ number: 1234 }, function(err, object) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accepts': 'application/vnd.api+json',
				},
				body: {
					data: {
						type: 'test-models',
						id: 1234,
						attributes: {
							field: 'value',
						},
					},
				},
				params: {
					id: 1234,
				},
			});
			jsonapify.assign(
				resource, { number: jsonapify.param('id') }
			)(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				var expected = req.body.data;
				expect(resdata.data).to.have.property('id', expected.id);
				expect(resdata.data).to.have.property('type', expected.type);
				expect(resdata.data).to.have.deep.property('attributes.field', expected.attributes.field);
				var selfUrl = util.format('/testmodels/%s', resdata.data.id);
				expect(resdata.data).to.have.deep.property('links.self', selfUrl);
				testModel.findOne({ number: expected.id }, function(err, object) {
					if (err) return done(err);
					expect(object).to.exist;
					expect(object).to.have.property('string', expected.attributes.field);
					done();
				});
			});
		});
	});
	
	it('updates resource and sends back 202 Accepted if noWait is set', function(done) {
		testModel.create({ number: 1234 }, function(err, object) {
			if (err) return next(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accepts': 'application/vnd.api+json',
				},
				body: {
					data: {
						type: 'test-models',
						id: 1234,
						attributes: {
							field: 'value',
						},
					},
				},
				params: {
					id: 1234,
				},
			});
			jsonapify.assign(resource, { number: jsonapify.param('id') }, {
					noWait: true
			})(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(202);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data', null);
				done();
			});
		});
	});
});
