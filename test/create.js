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
				id: jsonapify.field('_id'),
				links: {
					self: jsonapify.template('/testmodels/{_id}'),
				},
				attributes: {
					field: jsonapify.field('string'),
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
			expect(resdata.data).to.have.property('type', 'testmodels');
			expect(resdata.data).to.have.deep.property('attributes.field', 'foo');
			var expected = util.format('/testmodels/%s', resdata.data.id);
			expect(resdata.data).to.have.deep.property('links.self', expected);
			expect(res.get('Location')).to.equal(expected);
			TestModel.findById(resdata.data.id, function(err, object) {
				if (err) return done(err);
				expect(object).to.exist;
				expect(object).to.have.property('string', 'foo');
				done();
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
