var _ = require('lodash');
var async = require('async');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');

var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var enumerate = jsonapify.middleware.enumerate;

describe('enumerate', function() {
	var model, resource, req, res, objects;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('EnumerateTest', new mongoose.Schema);
			resource = new Resource(model, { type: 'test' });
			done();
		});
	});
	
	beforeEach(function(done) {
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();
		async.parallel([
			function(next) { model.create({}, next); },
			function(next) { model.create({}, next); },
			function(next) { model.create({}, next); },
		], function(err, results) {
			if (err) return done(err);
			objects = results;
			done();
		});
	});
	
	afterEach(function(done) {
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('responds with an array of resources', function(done) {
		enumerate(resource)(req, res, function(err) {
			if (err) return done(err);
			var resdata = res._getData();
			resdata = JSON.parse(resdata);
			expect(resdata).to.have.property('data');
			expect(resdata.data).to.have.length(objects.length);
			_.each(resdata.data, function(resourceData) {
				expect(resourceData).to.have.property('type', 'test');
			});
			expect(resdata).to.have.deep.property('meta.count', objects.length);
			done();
		});
	});
});
