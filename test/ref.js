var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

mongoose.connect('mongodb://localhost/test');

var Ref = require('../lib/ref');
var Field = require('../lib/field');
var Response = require('../lib/response');
var Resource = require('../lib/resource');
var TestModel = require('./testModel');

describe('Ref', function() {
	beforeEach(function() {
		// mockgoose.reset();
		mongoose.connection.db.dropDatabase();
	});
	
	after(function() {
		mongoose.disconnect();
	});
	
	describe('#serialize', function() {
		it('sets resource field from document', function(done) {
			var response = new Response;
			var resource = new Resource(TestModel, {
				id: new Field('_id'),
				type: 'testmodels',
			});
			var ref = new Ref(resource, '_id');
			var object = new TestModel;
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
			var linked = new TestModel;
			var response = new Response;
			var resource = new Resource(TestModel, {
				id: new Field('_id'),
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
