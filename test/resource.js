var _ = require('lodash');
var chai = require('chai');
var sinon = require('sinon');

var expect = chai.expect;
chai.use(require('sinon-chai'));

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
		sinon.stub(serializer, 'serialize',
			function(resdata, response, cb) {
				_.defer(cb, null, 'whatever');
			}
		);
		sinon.stub(serializer, 'deserialize',
			function(object, response, output, cb) {
				_.defer(cb, null, output);
			}
		);
		resource = new Resource(TestModel, {
			simple: 'a',
			complex: {
				inner: 'b',
			},
			serializable: serializer,
		});
	});
	
	beforeEach(function() {
		serializer.serialize.reset();
		serializer.deserialize.reset();
	});
	
	describe('#serialize', function() {
		var response, object;
		before(function() {
			object = new TestModel;
			response = new Response;
		});
		
		it('turns a document object into resource form', function(done) {
			resource.serialize(object, response, function(err, resdata) {
				if (err) return done(err);
				expect(resdata).to.have.property('simple', 'a');
				expect(resdata).to.have.deep.property('complex.inner', 'b');
				expect(serializer.serialize).to.have.been.called.once;
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		var response;
		before(function() {
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
				expect(serializer.deserialize).to.have.been.called.once;
				done();
			});
		});
		
		it('gives an error if resource data does not match', function(done) {
			var resdata = {
				simple: 'invalid',
				complex: {
					inner: 'invalid',
				},
				serializable: 'whatever',
			};
			var output = {};
			resource.deserialize(resdata, response, output, function(err) {
				expect(err).to.exist;
				done();
			});
		});
	});
});
