var chai = require('chai');
var expect = chai.expect;

var TestModel = require('./testModel');
var Const = require('../lib/accessors/const');

describe('Const', function() {
	describe('#serialize', function() {
		it('sets resource field to value', function(done) {
			var object = new TestModel;
			var constant = new Const('value');
			constant.serialize(object, null, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal('value');
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		it('does not change anything in document', function(done) {
			var output = {};
			var constant = new Const('value');
			constant.deserialize('value', null, output, function(err) {
				if (err) return done(err);
				expect(output).to.be.empty;
				done();
			});
		});
		
		it('gives an error if resource data does not match', function(done) {
			var output = {};
			var constant = new Const('value');
			constant.deserialize('invalid', null, output, function(err) {
				expect(err).to.exist;
				expect(output).to.be.empty;
				done();
			});
		});
	});
});
