var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var Resource = require('../lib/resource');
var Response = require('../lib/response');
var TestModel = require('./testModel');

function TestSerializer() {}
TestSerializer.prototype.serialize = function() {};
TestSerializer.prototype.deserialize = function() {};

describe('Resource', function() {
	var resource, serializer;
	before(function() {
		mongoose.connect('mongodb://localhost/test');
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
		mockgoose.reset();
	});
	
	after(function() {
		mongoose.disconnect();
	});
	
	describe('#serialize', function() {
		var response, object, mock;
		before(function() {
			mock = sinon.mock(serializer);
			mock.expects('serialize').callsArgAsync(2).once();
			response = new Response;
			object = new TestModel;
		});
		
		it('turns a document object into resource form', function(done) {
			var output = {};
			resource.serialize(object, response, output, function(err) {
				if (err) return done(err);
				expect(output).to.have.property('simple', 'a');
				expect(output).to.have.deep.property('complex.inner', 'b');
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
