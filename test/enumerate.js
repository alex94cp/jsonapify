var _ = require('lodash');
var chai = require('chai');
var async = require('async');
var common = require('./common');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var jsonapify = require('../');
var Resource = require('../lib/resource');

describe('enumerate', function() {
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
		// mockgoose.reset();
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('lists resources and sends back resource info', function(done) {
		async.parallel([
			function(cb) { testModel.create({}, cb); },
			function(cb) { testModel.create({}, cb); },
			function(cb) { testModel.create({}, cb); },
		], function(err, results) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accept': 'application/vnd.api+json',
				},
			});
			var res = httpMocks.createResponse();
			var enumerate = common.joinMiddleware(jsonapify.enumerate(resource));
			enumerate(req, res, function(err) {
				if (err) return done(err);
				var count = results.length;
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				_(results).tap(function(results) {
					var count = results.length;
					expect(resdata.data).to.have.length(count);
					expect(resdata).to.have.deep.property('meta.count', count);
				}).each(function(object) {
					var match = _.pick(object, ['type', 'id']);
					expect(resdata.data).to.include(match);
				});
				done();
			});
		});
	});
	
	it('lists subresources and sends back resource info', function(done) {
		async.parallel([
			function(cb) { testModel.create({ string: 'a' }, cb); },
			function(cb) { testModel.create({ string: 'a' }, cb); },
			function(cb) { testModel.create({ string: 'a' }, cb); },
			function(cb) { testModel.create({ string: 'b' }, cb); },
			function(cb) { testModel.create({ string: 'b' }, cb); },
			function(cb) { testModel.create({ string: 'c' }, cb); },
		], function(err, results) {
			if (err) return done(err);
			var req = httpMocks.createRequest({
				headers: {
					'Content-Type': 'application/vnd.api+json',
					'Accept': 'application/vnd.api+json',
				},
				params: {
					id: results[0]._id,
				},
			});
			var res = httpMocks.createResponse();
			var enumerate = common.joinMiddleware(jsonapify.enumerate(
				resource, jsonapify.param('id'),
				resource, { string: jsonapify.parent('string') }
			));
			enumerate(req, res, function(err) {
				if (err) return done(err);
				expect(res.statusCode).to.equal(200);
				var resdata = JSON.parse(res._getData());
				expect(resdata).to.have.property('data');
				_(results).filter({ string: 'a' }).tap(function(results) {
					var count = results.length;
					expect(resdata.data).to.have.length(count);
					expect(resdata).to.have.deep.property('meta.count', count);
				}).each(function(object) {
					var match = _.pick(object, ['type', 'id']);
					expect(resdata.data).to.include(match);
				});
				done();
			});
		});
	});
	
	it('sends back 200 OK response with empty array if no resources found', function(done) {
		var req = httpMocks.createRequest({
			headers: {
				'Content-Type': 'application/vnd.api+json',
				'Accept': 'application/vnd.api+json',
			},
		});
		var res = httpMocks.createResponse();
		var enumerate = common.joinMiddleware(jsonapify.enumerate(resource));
		enumerate(req, res, function(err) {
			if (err) return done(err);
			expect(res.statusCode).to.equal(200);
			var resdata = JSON.parse(res._getData());
			expect(resdata).to.have.property('data');
			expect(resdata).to.have.deep.property('meta.count', 0);
			expect(resdata.data).to.be.an.instanceOf(Array);
			expect(resdata.data).to.have.length(0);
			done();
		});
	});
});
