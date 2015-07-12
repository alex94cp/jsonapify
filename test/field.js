var chai = require('chai');
var sinon = require('sinon');

var expect = chai.expect;
chai.use(require('sinon-chai'));

var Field = require('../lib/field');

function makeAccessor() {
	return {
		serialize: sinon.stub(),
		deserialize: sinon.stub(),
	};
}

describe('Field', function() {
	describe('#name', function() {
		it('gives assigned field name', function() {
			var expected = 'name';
			var field = new Field(expected, 'value');
			expect(field).to.have.property('name', expected);
		});
	});
	
	describe('#readable', function() {
		it('gives true if field is readable', function() {
			var field = new Field('name', 'value', { readable: true });
			expect(field).to.have.property('readable', true);
		});
		
		it('gives false if field is not readable', function() {
			var field = new Field('name', 'value', { readable: false });
			expect(field).to.have.property('readable', false);
		});
	});
	
	describe('#writable', function() {
		it('gives true if field is writable', function() {
			var field = new Field('name', 'value', { writable: true });
			expect(field).to.have.property('writable', true);
		});
		
		it('gives false if field is not writable', function() {
			var field = new Field('name', 'value', { writable: false });
			expect(field).to.have.property('writable', false);
		});
	});
	
	describe('#nullable', function() {
		it('gives true if field is nullable', function() {
			var field = new Field('name', 'value', { nullable: true });
			expect(field).to.have.property('nullable', true);
		});
		
		it('gives false if field is not nullable', function() {
			var field = new Field('name', 'value', { nullable: false });
			expect(field).to.have.property('nullable', false);
		});
	});
	
	describe('#serialize', function() {
		var accessor, object;
		before(function() {
			accessor = makeAccessor();
		});
		
		beforeEach(function() {
			object = {};
			accessor.serialize.reset();
			accessor.deserialize.reset();
		});
		
		it('gives immediate value', function(done) {
			var expected = 'value';
			var field = new Field('name', expected);
			field.serialize(object, null, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(expected);
				done();
			});
		});
		
		it('invokes accessor#serialize', function(done) {
			var expected = 'value';
			var field = new Field('name', accessor);
			accessor.serialize.callsArgWithAsync(2, null, expected);
			field.serialize(object, null, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal(expected);
				expect(accessor.serialize).to.have.been.called.once;
				done();
			});
		});
		
		it('gives undefined if field is not readable', function(done) {
			var field = new Field('name', 'value', { readable: false });
			field.serialize(object, null, function(err, value) {
				if (err) return done(err);
				expect(value).to.be.undefined;
				done();
			});
		});
		
		it('gives an error if undefined value and field is not nullable', function(done) {
			accessor.serialize.callsArgWithAsync(2, null, undefined);
			var field = new Field('name', accessor, { nullable: false });
			field.serialize(object, null, function(err, value) {
				expect(err).to.exist;
				expect(accessor.serialize).to.have.been.called.once;
				done();
			});
		});
		
		it('propagates accessor#serialize errors', function(done) {
			accessor.serialize.callsArgWithAsync(2, new Error);
			var field = new Field('name', accessor);
			field.serialize(object, null, function(err, value) {
				expect(err).to.exist;
				done();
			});
		});
	});
	
	describe('#deserialize', function(done) {
		var accessor, response, output;
		before(function() {
			accessor = makeAccessor();
		});
		
		beforeEach(function() {
			output = {};
			accessor.serialize.reset();
			accessor.deserialize.reset();
		});
		
		it('invokes accessor#deserialize', function(done) {
			accessor.deserialize.callsArgWithAsync(3, null);
			var field = new Field('name', accessor);
			field.deserialize('value', null, output, function(err) {
				if (err) return done(err);
				expect(output).to.be.empty;
				expect(accessor.deserialize).to.have.been.called.once;
				done();
			});
		});
		
		it('omits field if not writable', function(done) {
			accessor.deserialize.callsArgWithAsync(3, null);
			var field = new Field('name', accessor, { writable: false });
			field.deserialize('value', null, output, function(err) {
				if (err) return done(err);
				expect(output).to.be.empty;
				expect(accessor.deserialize).to.not.have.been.called;
				done();
			});
		});
		
		it('gives an error if undefined value and field is not nullable', function(done) {
			accessor.deserialize.callsArgWithAsync(3, null);
			var field = new Field('name', accessor);
			field.deserialize(undefined, null, output, function(err) {
				expect(err).to.exist;
				expect(output).to.be.empty;
				expect(accessor.deserialize).to.not.have.been.called;
				done();
			});
		});
		
		it('gives an error if field value does not match expected value', function(done) {
			var field = new Field('name', 'expected');
			field.deserialize('invalid', null, output, function(err) {
				expect(err).to.exist;
				expect(output).to.be.empty;
				done();
			});
		});
		
		it('propagates accessor#deserialize errors', function(done) {
			accessor.deserialize.callsArgWithAsync(3, new Error);
			var field = new Field('name', accessor);
			field.deserialize('value', null, output, function(err) {
				expect(err).to.exist;
				expect(output).to.be.empty;
				expect(accessor.deserialize).to.have.been.called.once;
				done();
			});
		});
	});
});
