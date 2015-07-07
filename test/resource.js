var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var Resource = require('../lib/resource');
var Response = require('../lib/response');
var TestModel = require('./testModel');

function TestSerializer() {}
TestSerializer.prototype.serialize = function() {};
TestSerializer.prototype.deserialize = function() {};

describe('Resource', function() {
	var resource, serializer;
	before(function() {
		serializer = new TestSerializer;
		resource = new Resource(TestModel, {
			simple: 'a',
			complex: {
				inner: 'b',
			},
			serializable: serializer,
		});
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
		var response, mock;
		before(function() {
			mock = sinon.mock(serializer);
			mock.expects('deserialize').callsArgAsync(3).once();
			response = new Response();
		});
		
		it('turns resource data into a document object', function(done) {
			var resdata = {
				simple: 'a',
				complex: {
					inner: 'b',
				},
				serializable: 'c',
			};
			var output = {};
			resource.deserialize(resdata, response, output, function(err) {
				if (err) return done(err);
				mock.verify();
				done();
			});
		});
		
		it('gives an error if resource data does not match', function(done) {
			var resdata = {
				simple: 'invalid',
				complex: {
					inner: 'invalid',
				},
			};
			var output = {};
			resource.deserialize(resdata, response, output, function(err) {
				expect(err).to.exist;
				done();
			});
		});
	});
});
