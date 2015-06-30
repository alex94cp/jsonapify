var chai = require('chai');
var expect = chai.expect;

var Const = require('../lib/const');
var Response = require('../lib/response');
var TestModel = require('./testModel');

describe('Const', function() {
	describe('#serialize', function() {
		it('sets resource field to value', function(done) {
			var output = {};
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
			var output = new TestModel;
			var response = new Response;
			var constant = new Const('value');
			constant.deserialize('value', response, output, done);
		});
	});
});
