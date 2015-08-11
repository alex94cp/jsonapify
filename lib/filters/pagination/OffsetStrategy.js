var url = require('url');

var _ = require('lodash');

function OffsetStrategy() {}

OffsetStrategy.prototype.queryParser = function(req, callback) {
	var param = req.query['page'];
	var pageInfo = _.pick(param, 'offset', 'limit');
	if (pageInfo.offset !== undefined && pageInfo.limit !== undefined)
		callback(pageInfo);
};

OffsetStrategy.prototype.handler = function(transaction, req, type, params) {
	var pageOffset = params.offset, pageLimit = params.limit;

	transaction.subscribe(type, 'query', function(resource, query) {
		query.skip(pageOffset).limit(pageLimit);
	});

	transaction.subscribe(type, 'end', function(resource) {
		var selfLink = req.originalUrl;
		var response = transaction.response;
		var count = response.meta['count'];
		response.links['first'] = modifyQuery(selfLink, { page: {
			offset: 0, limit: pageLimit
		}});
		response.links['last'] = modifyQuery(selfLink, { page: {
			offset: count - pageLimit, limit: pageLimit
		}});
		if (pageOffset > 0) {
			response.links['prev'] = modifyQuery(selfLink, { page: {
				offset: pageOffset - pageLimit
			}});
		}
		if ((pageOffset + pageLimit) < count) {
			response.links['next'] = modifyQuery(selfLink, { page: {
				offset: pageOffset + pageLimit
			}});
		}
	});
};

function modifyQuery(uri, name, query) {
	var info = url.parse(uri);
	info.search = undefined;
	_.assign(info.query, query);
	return url.format(info);
}

module.exports = OffsetStrategy;
