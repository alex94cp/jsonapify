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
	this._resource = resource;
	var pageSize = req.query['page[size]'];
	var pageNumber = req.query['page[number]'];
	if (!pageSize || !pageNumber) return;
	var handler = function(resview, query) {
		var pageSize = req.query['page[size]'];
		var pageNumber = req.query['page[number]'];
		query.skip(pageNumber * pageSize).limit(pageSize);
	};
	resource.on('find', handler);
	this._handlers.push({ event: 'find', handler: handler });
};

Paginator.prototype.addResponseInfo = function(req, response) {
	var count = response.meta('count');
	var pageSize = req.query['page[size]'];
	var pageNumber = req.query['page[number]'];
	if (!count || !pageSize || !pageNumber) return;
	var pageCount = Math.ceil(count / pageSize);
	var thisUrl = url.parse(req.originalUrl, true);
	thisUrl.query['page[number]'] = 0;
	response.link('first', url.format(thisUrl));
	thisUrl.query['page[number]'] = pageCount;
	response.link('last', url.format(thisUrl));
	if (pageNumber > 0) {
		thisUrl.query['page[number]'] = pageNumber - 1;
		response.link('prev', url.format(thisUrl));
	}
	if (pageNumber < pageCount) {
		thisUrl.query['page[number]'] = pageNumber + 1;
		response.link('next', url.format(thisUrl));
	}
};

Paginator.prototype.remove = function() {
	var self = this;
	_.each(this._handlers, function(info) {
		self._resource.removeListener(info.event, info.handler)
	});
	this._resource = null;
	this._handlers = [];
};

module.exports = exports = Paginator;
exports.create = createPaginator;
