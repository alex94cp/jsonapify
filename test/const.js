var chai = require('chai');
var expect = chai.expect;

var TestModel = require('./testModel');
var Response = require('../lib/response');
var Const = require('../lib/accessors/const');

describe('Const', function() {
	describe('#serialize', function() {
		it('sets resource field to value', function(done) {
			var object = new TestModel;
			var response = new Response;
			var constant = new Const('value');
			constant.serialize(object, response, function(err, value) {
				if (err) return done(err);
				expect(value).to.equal('value');
				done();
			});
		});
	});
	
	describe('#deserialize', function() {
		it('does not change anything in document', function(done) {
			var output = {};
			var response = new Response;
			var constant = new Const('value');
			constant.deserialize('value', response, output, done);
		});
		
		it('gives an error if resource data does not match', function(done) {
			var output = {};
			var response = new Response;
			var constant = new Const('value');
			constant.deserialize('invalid', response, output, function(err) {
				expect(err).to.exist;
				done();
			});
		});
	});
});
