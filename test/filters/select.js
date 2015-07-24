var _ = require('lodash');
var chai = require('chai');
chai.use(require('sinon-chai'));
var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var expect = chai.expect;

var common = require('../common');
var jsonapify = require('../../');
var Resource = jsonapify.Resource;
var Response = jsonapify.Response;
var Transaction = jsonapify.Transaction;
var select = jsonapify.filters.select;

describe('select', function() {
	var resource, accessors, transaction;
	beforeEach(function() {
		accessors = {
			selected: common.createAccessor(),
			notSelected: common.createAccessor(),
		};
		resource = new Resource({
			type: 'test',
			selected: accessors.selected,
			'not-selected': accessors.notSelected,
		});
		var res = httpMocks.createResponse();
		var response = new Response(res);
		transaction = new Transaction(resource, response);
	});
	
	it('makes resource views contain only selected fields', function(done) {
		select()(transaction);
		var req = httpMocks.createRequest({ query: { fields: 'selected' }});
		transaction.notify(resource, 'start', req);
		common.initAccessor(accessors.selected, 'value');
		common.initAccessor(accessors.notSelected, 'value');
		var resview = resource.view(transaction);
		resview.serialize({}, function(err, resdata) {
			if (err) return done(err);
			expect(accessors.selected.serialize).to.have.been.called.once;
			expect(accessors.notSelected.serialize).to.not.have.been.called;
			done();
		});
	});
	
	it('selects a given resource type fields', function(done) {
		select()(transaction);
		var req = httpMocks.createRequest({
			query: { fields: { test: 'selected' }},
		});
		transaction.notify(resource, 'start', req);
		common.initAccessor(accessors.selected, 'value');
		common.initAccessor(accessors.notSelected, 'value');
		var resview = resource.view(transaction);
		resview.serialize({}, function(err, resdata) {
			if (err) return done(err);
			expect(accessors.selected.serialize).to.have.been.called.once;
			expect(accessors.notSelected.serialize).to.not.have.been.called;
			done();
		});
	});
});
