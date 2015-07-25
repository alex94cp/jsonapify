var url = require('url');

var _ = require('lodash');

var common = require('./common');

function paginate() {
	return common.createFilter(queryParser, function(transaction, req, type, pageInfo) {
		var pageNumber = pageInfo.number, pageSize = pageInfo.size;
		
		transaction.subscribe(type, 'query', function(resource, query) {
			query.skip((pageNumber - 1) * pageSize).limit(pageSize);
		});
		
		transaction.subscribe(type, 'end', function(resource) {
			var response = transaction.response;
			var count = response.meta['count'];
			var pageCount = Math.ceil(count / pageSize);
			var selfLink = req.originalUrl;
			response.links['first'] = modifyQuery(selfLink, 'page.number', 1);
			response.links['last'] = modifyQuery(selfLink, 'page.number', pageCount);
			if (pageNumber > 1) {
				response.links['prev'] = modifyQuery(selfLink, 'page.number', pageNumber - 1);
			}
			if (pageNumber < pageCount) {
				response.links['next'] = modifyQuery(selfLink, 'page.number', pageNumber + 1);
			}
		});
	});
}

function queryParser(req, callback) {
	var param = req.query['page'];
	var pageInfo = _.pick(param, 'size', 'number');
	if (!pageInfo.size || !pageInfo.number) return;
	callback('', pageInfo);
}

function modifyQuery(uri, name, value) {
	var info = url.parse(uri);
	info.search = undefined;
	_.set(info.query, name, value);
	return url.format(info);
}

module.exports = paginate;
