var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var mongoose = require('mongoose');
// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

var Resource = require('../lib/resource');
var Response = require('../lib/response');

function TestSerializer() {}
TestSerializer.prototype.serialize = function() {};
TestSerializer.prototype.deserialize = function() {};

describe('Resource', function() {
	var TestModel, resource, serializer;
	before(function() {
		mongoose.connect('mongodb://localhost/test');
		TestModel = require('./testModel');
		serializer = new TestSerializer;
		resource = new Resource(TestModel, {
			simple: 'a',
			complex: {
				inner: 'b',
			},
			serializable: serializer,
		});
	});
	
	beforeEach(function() {
		// mockgoose.reset();
		mongoose.connection.db.dropDatabase();
	});
	
	after(function(done) {
		mongoose.disconnect(done);
	});
	
	describe('#serialize', function() {
		var response, object, mock;
		before(function() {
			object = new TestModel;
			response = new Response;
			mock = sinon.mock(serializer);
			mock.expects('serialize').callsArgAsync(2).once();
		});
		
		it('turns a document object into resource form', function(done) {
			resource.serialize(object, response, function(err, resdata) {
				if (err) return done(err);
				expect(resdata).to.have.property('simple', 'a');
				expect(resdata).to.have.deep.property('complex.inner', 'b');
				mock.verify();
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		var response, resdata, mock;
		before(function() {
			mock = sinon.mock(serializer);
			mock.expects('deserialize').callsArgAsync(3).once();
			response = new Response();
			resdata = {
				simple: 'a',
				complex: {
					inner: 'b',
				},
				serializable: 'c',
			};
		});
		
		it('turns resource data into a document object', function(done) {
			var output = new TestModel;
			resource.deserialize(resdata, response, output, function(err) {
				if (err) return done(err);
				mock.verify();
				done();
			});
		});
	});
});
