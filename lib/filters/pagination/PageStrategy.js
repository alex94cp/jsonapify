var url = require('url');

var _ = require('lodash');

function PageStrategy() {}

PageStrategy.prototype.queryParser = function(req, callback) {
	var param = req.query['page'];
	var pageInfo = _.pick(param, 'size', 'number');
	if (pageInfo.size !== undefined && pageInfo.number !== undefined)
		callback(pageInfo);
};

PageStrategy.prototype.handler = function(transaction, req, type, params) {
	var pageNumber = params.number, pageSize = params.size;

	transaction.subscribe(type, 'query', function(resource, query) {
		query.skip((pageNumber - 1) * pageSize).limit(pageSize);
	});

	transaction.subscribe(type, 'end', function(resource) {
		var selfLink = req.originalUrl;
		var response = transaction.response;
		var count = response.meta['count'];
		var pageCount = Math.ceil(count / pageSize);
		response.links['first'] = modifyQuery(selfLink, { page: { number: 1 }});
		response.links['last'] = modifyQuery(selfLink, { page: { number: pageCount }});
		if (pageNumber > 1)
			response.links['prev'] = modifyQuery(selfLink, { page: { number: pageNumber - 1 }});
		if (pageNumber < pageCount)
			response.links['next'] = modifyQuery(selfLink, { page: { number: pageNumber + 1 }});
	});
};

function modifyQuery(uri, name, query) {
	var info = url.parse(uri);
	info.search = undefined;
	_.assign(info.query, query);
	return url.format(info);
}

module.exports = PageStrategy;
