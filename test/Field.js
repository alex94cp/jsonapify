var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var expect = chai.expect;

var common = require('./common');
var Field = require('../lib/Field');
var Resource = require('../lib/Resource');

describe('Field', function() {
	var resource;
	before(function() {
		resource = new Resource({ type: 'test' });
	});
	
	describe('#name', function() {
		it('returns the field name', function() {
			var expected = 'name';
			var field = new Field(resource, expected, null);
			expect(field).to.have.property('name', expected);
		});
	});
	
	describe('#resource', function() {
		it('returns the resource the field is associated with', function() {
			var field = new Field(resource, 'name', null);
			expect(field).to.have.property('resource', resource);
		});
	});
	
	describe('#readable', function() {
		it('returns true if field is readable', function() {
			var field = new Field(resource, 'name', null, { readable: true });
			expect(field).to.have.property('readable', true);
		});
		
		it('returns false if field is not readable', function() {
			var field = new Field(resource, 'name', null, { readable: false });
			expect(field).to.have.property('readable', false);
		});
	});
	
	describe('#writable', function() {
		it('returns true if field is writable', function() {
			var field = new Field(resource, 'name', null, { writable: true });
			expect(field).to.have.property('writable', true);
		});
		
		it('returns false if field is not writable', function() {
			var field = new Field(resource, 'name', null, { writable: false });
			expect(field).to.have.property('writable', false);
		});
	});
	
	describe('#nullable', function() {
		it('returns true if field is nullable', function() {
			var field = new Field(resource, 'name', null, { nullable: true });
			expect(field).to.have.property('nullable', true);
		});
		
		it('returns false if field is not nullable', function() {
			var field = new Field(resource, 'name', null, { nullable: false });
			expect(field).to.have.property('nullable', false);
		});
	});
	
	describe('#accessProperty', function() {
		it('invokes accessProperty method on accessor', function() {
			var callback = sinon.spy();
			var accessor = common.createAccessor();
			accessor.accessProperty.callsArgWith(0, 'property');
			var field = new Field(resource, 'name', accessor);
			field.accessProperty(callback);
			expect(accessor.accessProperty).to.have.been.calledWith(callback);
			expect(callback).to.have.been.calledWith('property');
		});
	});
	
	describe('#serialize', function() {
		var transaction, object;
		beforeEach(function() {
			object = {};
			transaction = common.createTransaction(resource);
		});
		
		it('gives constant value in callback', function(done) {
			var expected = 'value';
			var field = new Field(resource, 'name', expected);
			field.serialize(transaction, object, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(expected);
				done();
			});
		});
		
		it('invokes serialize method on accessor', function(done) {
			var expected = 'value';
			var accessor = common.createAccessor();
			accessor.serialize.callsArgWithAsync(3, null, expected);
			var field = new Field(resource, 'name', accessor);
			field.serialize(transaction, object, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(expected);
				expect(accessor.serialize).to.have.been.calledWith(field, transaction, object);
				done();
			});
		});
		
		it('gives undefined if field is not readable', function(done) {
			var field = new Field(resource, 'name', 'value', { readable: false });
			field.serialize(transaction, object, function(err, value) {
				if (err) return done(err);
				expect(value).to.not.exist;
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		var transaction, object;
		beforeEach(function() {
			transaction = common.createTransaction(resource);
			object = {};
		});
		
		it('invokes callback with output object', function(done) {
			var expected = 'value';
			var field = new Field(resource, 'name', expected);
			field.deserialize(transaction, expected, object, function(err, output) {
				if (err) return done(err);
				expect(output).to.equal(object);
				expect(object).to.be.empty;
				done();
			});
		});
		
		it('does not change object if field is not writable', function(done) {
			var expected = 'value';
			var field = new Field(resource, 'name', expected, { writable: false });
			field.deserialize(transaction, expected, object, function(err, output) {
				if (err) return done(err);
				expect(output).to.equal(object);
				expect(object).to.be.empty;
				done();
			});
		});
		
		
		it('invokes deserialize method on accessor', function(done) {
			var expected = 'value';
			var accessor = common.createAccessor();
			accessor.deserialize.callsArgWithAsync(4, null, object);
			var field = new Field(resource, 'name', accessor);
			field.deserialize(transaction, expected, object, function(err, output) {
				if (err) return done(err);
				expect(output).to.equal(object);
				expect(accessor.deserialize).to.have.been.calledWith(field, transaction, expected, object);
				done();
			});
		});
		
		it('gives an error if not expected field value', function(done) {
			var field = new Field(resource, 'name', 'value');
			field.deserialize(transaction, 'invalid', object, function(err, output) {
				expect(err).to.exist;
				expect(object).to.be.empty;
				done();
			});
		});
		
		it('gives an error if value is undefined for not nullable field', function(done) {
			var field = new Field(resource, 'name', 'value');
			field.deserialize(transaction, undefined, object, function(err, output) {
				expect(err).to.exist;
				expect(object).to.be.empty;
				done();
			});
		});
	});
});
