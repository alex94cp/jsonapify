var url = require('url');
var _ = require('lodash');
var Resource = require('../resource');

function Paginator() {
	this._handlers = [];
	this._resource = null;
}

function createPaginator() {
	return new Paginator;
}

Paginator.prototype.initialize = function(resource, req) {
	var pageSize = _.get(req.query, 'page.size');
	var pageNumber = _.get(req.query, 'page.number');
	if (_.isUndefined(pageSize) ||
	    _.isUndefined(pageNumber))
	    	return;
	this._resource = resource;
	var handler = function(resview, query) {
		query.skip(pageNumber * pageSize).limit(pageSize);
	};
	resource.on('find', handler);
	this._handlers.push({ event: 'find', handler: handler });
};

Paginator.prototype.addResponseInfo = function(req, response) {
	var count = response.meta('count');
	var pageSize = _.get(req.query, 'page.size');
	var pageNumber = _.get(req.query, 'page.number');
	if (_.isUndefined(count) ||
	    _.isUndefined(pageSize) ||
	    _.isUndefined(pageNumber))
	    	return;
	pageSize = parseInt(pageSize);
	pageNumber = parseInt(pageNumber);
	var pageCount = Math.ceil(count / pageSize);
	var pageLast = pageCount - 1;
	var thisUrl = url.parse(req.originalUrl, true);
	thisUrl.search = undefined;
	thisUrl.query['page[number]'] = 0;
	response.link('first', url.format(thisUrl));
	thisUrl.query['page[number]'] = pageLast;
	response.link('last', url.format(thisUrl));
	if (pageNumber > 0) {
		thisUrl.query['page[number]'] = pageNumber - 1;
		response.link('prev', url.format(thisUrl));
	}
	if (pageNumber < pageLast) {
		thisUrl.query['page[number]'] = pageNumber + 1;
		response.link('next', url.format(thisUrl));
	}
};

Paginator.prototype.remove = function() {
	if (!this._resource) return;
	var self = this;
	_.each(this._handlers, function(info) {
		self._resource.removeListener(info.event, info.handler)
	});
	this._resource = null;
	this._handlers = [];
};

module.exports = exports = Paginator;
exports.create = createPaginator;
