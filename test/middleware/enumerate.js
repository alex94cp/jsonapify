var _ = require('lodash');
var chai = require('chai');
var sinon = require('sinon');
var async = require('async');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');

var Runtime = jsonapify.Runtime;
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
		Runtime.addResource('EnumResource', resource);
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
		Runtime.removeResource('EnumResource');
		mongoose.connection.db.dropDatabase(done);
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	it('responds with an array of resources', function(done) {
		common.initAccessor(accessor, 'value', null);
		enumerate('EnumResource')(req, res, function(err) {
			if (err) return done(err);
			expect(accessor.serialize).to.have.been.called.thrice;
			expect(accessor.deserialize).to.not.have.been.called;
			done();
		});
	});
	
	it('invokes transaction filters', function(done) {
		var filter = sinon.spy();
		common.initAccessor(accessor, 'value', null);
		enumerate('EnumResource', { filters: [filter] })(req, res, function(err) {
			if (err) return done(err);
			expect(filter).to.have.been.called.once;
			done();
		});
	});
});
