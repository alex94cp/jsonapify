var _ = require('lodash');
var chai = require('chai');
var sinon = require('sinon');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Resource = require('../lib/resource');
var TestModel = require('./testModel');

function TestSerializer() {}
TestSerializer.prototype.serialize = function() {};
TestSerializer.prototype.deserialize = function() {};

describe('Resource', function() {
	var resource, expected, serializer;
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
		expected = {
			simple: 'a',
			complex: {
				inner: 'b',
			},
			serializable: serializer,
		}
		resource = new Resource(TestModel, expected);
	});
	
	beforeEach(function() {
		serializer.serialize.reset();
		serializer.deserialize.reset();
	});
	
	describe('#model', function() {
		it('gives resource associated model', function() {
			expect(resource).to.have.property('model', TestModel);
		});
	});
	
	describe('#field', function() {
		it('returns resource field by name', function(done) {
			var object = {};
			var inner = resource.field('complex.inner');
			expect(inner).to.exist.and.have.property('name', 'complex.inner');
			inner.serialize(object, null, function(err, value) {
				expect(err).to.not.exist;
				expect(value).to.equal(expected.complex.inner);
				done();
			});
		});
	});
	
	describe('#serialize', function() {
		var response, object;
		before(function() {
			object = new TestModel;
		});
		
		it('turns a document object into resource form', function(done) {
			resource.serialize(object, null, function(err, resdata) {
				if (err) return done(err);
				expect(resdata).to.have.property('simple', 'a');
				expect(resdata).to.have.deep.property('complex.inner', 'b');
				expect(serializer.serialize).to.have.been.called.once;
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		it('turns resource data into a document object', function(done) {
			var resdata = {
				simple: expected.simple,
				complex: {
					inner: expected.complex.inner,
				},
				serializable: 'c',
			};
			var output = {};
			resource.deserialize(resdata, null, output, function(err) {
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
			resource.deserialize(resdata, null, output, function(err) {
				expect(err).to.exist;
				expect(output).to.be.empty;
				done();
			});
		});
	});
});
