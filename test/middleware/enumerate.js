var _ = require('lodash');
var chai = require('chai');
var async = require('async');
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('./common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var enumerate = jsonapify.middleware.enumerate;

describe('enumerate', function() {
	var model, resource, accessor, req, res, objects;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err);
			model = mongoose.model('EnumerateTest', new mongoose.Schema);
			done();
		});
	});
	
	beforeEach(function(done) {
		req = httpMocks.createRequest();
		res = httpMocks.createResponse();
		accessor = common.createAccessor();
		resource = new Resource(model, { type: 'test', field: accessor });
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
		accessor.deserialize.callsArgWithAsync(4, null);
		accessor.serialize.callsArgWithAsync(3, null, 'value');
		enumerate(resource)(req, res, function(err) {
			if (err) return done(err);
			expect(accessor.serialize).to.have.been.called.thrice;
			expect(accessor.deserialize).to.not.have.been.called;
			done();
		});
	});
});
