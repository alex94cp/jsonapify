var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var Ref = require('../lib/accessors/ref');
var Response = require('../lib/response');
var Resource = require('../lib/resource');
var Property = require('../lib/accessors/property');

describe('Ref', function() {
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
		it('sets resource field from document', function(done) {
			var response = new Response;
			var resource = new Resource(testModel, {
				id: new Property('_id'),
				type: 'testmodels',
			});
			var ref = new Ref(resource, '_id');
			var object = new testModel;
			object.save(function(err) {
				if (err) return done(err);
				ref.serialize(object, response, function(err, resdata) {
					if (err) return done(err);
					expect(resdata).to.have.deep.property('data.id');
					expect(resdata).to.have.deep.property('data.type', 'testmodels');
					expect(resdata.data.id).to.satisfy(function(id) {
						return id.equals(object._id);
					});
					var include = response.include('testmodels', object._id);
					expect(include).to.have.property('id');
					expect(include).to.have.property('type', 'testmodels');
					expect(include.id).to.satisfy(function(id) {
						return id.equals(object._id);
					});
					done();
				});
			});
		});
	});
	
	describe('#deserialize', function() {
		it('sets document property from resource field', function(done) {
			var output = {};
			var linked = new testModel;
			var response = new Response;
			var resource = new Resource(testModel, {
				id: new Property('_id'),
				type: 'testmodels',
			});
			var resdata = {
				data: {
					id: linked._id,
					type: 'testmodels',
				},
			};
			var ref = new Ref(resource, '_id');
			ref.deserialize(resdata, response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('_id');
				expect(output._id).to.satisfy(function(id) {
					return id.equals(linked._id);
				});
				done();
			});
		});
	});
});
