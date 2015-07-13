var _ = require('lodash');
var chai = require('chai');
var async = require('async');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var Response = require('../lib/response');
var Resource = require('../lib/resource');
var Refs = require('../lib/accessors/refs');
var Property = require('../lib/accessors/property');

describe('Refs', function() {
	var testModel;
	before(function(done) {
		mongoose.connect('mongodb://localhost/test', function(err) {
			if (err) return done(err)
			testModel = require('./testModel');
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
	
	describe('#serialize', function() {
		var resource, response;
		beforeEach(function() {
			resource = new Resource(testModel, {
				id: new Property('_id'),
				type: 'test-models',
				related: new Refs('refs'),
			});
			var res = httpMocks.createResponse();
			response = new Response(res);
		});
		
		it('sets resource field from document', function(done) {
			async.parallel([
				function(cb) { testModel.create({}, cb); },
				function(cb) { testModel.create({}, cb); },
				function(cb) { testModel.create({}, cb); },
			], function(err, results) {
				if (err) return done(err);
				var object = new testModel;
				var refs = new Refs(resource, 'refs');
				var ids = object.refs = _.pluck(results, '_id');
				refs.serialize(object, response, function(err, resdata) {
					if (err) return done(err);
					expect(resdata).to.have.property('data');
					expect(resdata.data).to.have.length(results.length);
					_.each(resdata.data, function(relData) {
						expect(relData).to.have.property('id');
						expect(relData.id).to.satisfy(function(relId) {
							return _.any(ids, function(id) {
								return id.equals(relId);
							});
						});
						expect(relData).to.have.property('type', 'test-models');
					});
					done();
				});
			});
		});
	});
	
	describe('#deserialize', function() {
		var resource, response, output;
		before(function() {
			output = {};
			resource = new Resource(testModel, {
				id: new Property('_id'),
				type: 'test-models',
				related: new Refs('refs'),
			});
		});
		
		beforeEach(function() {
			var res = httpMocks.createResponse();
			response = new Response(res);
		});
		
		it('sets document property from resource field', function(done) {
			var resdata = {
				data: [
					mongoose.Types.ObjectId(),
					mongoose.Types.ObjectId(),
					mongoose.Types.ObjectId(),
				],
			};
			var refs = new Refs(resource, 'refs');
			refs.deserialize(resdata, response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('refs');
				expect(output.refs).to.deep.equal(resdata.data);
				done();
			});
		});
	});
});
