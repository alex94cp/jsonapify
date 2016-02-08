var common = require('./common');

var _ = require('lodash');

function paginate() {
	return common.createFilter(queryParser, function(transaction, req, type, params) {
		var pageOffset = params.offset, pageLimit = params.limit;

		transaction.subscribe(type, 'query', function(resource, query) {
			query.skip(pageOffset).limit(pageLimit);
		});

		transaction.subscribe(type, 'end', function(resource) {
			var selfLink = req.originalUrl;
			var response = transaction.response;
			var count = response.meta['count'];
			response.links['first'] = common.modifyQuery(selfLink, { page: {
				offset: 0
			}});
			response.links['last'] = common.modifyQuery(selfLink, { page: {
				offset: count - pageLimit
			}});
			if (pageOffset > 0) {
				response.links['prev'] = common.modifyQuery(selfLink, { page: {
					offset: (pageOffset - pageLimit < 0) ? 0 : pageOffset - pageLimit
				}});
			}
			if ((pageOffset + pageLimit) < count) {
				response.links['next'] = common.modifyQuery(selfLink, { page: {
					offset: pageOffset + pageLimit
				}});
			}
		});
	});
}

function queryParser(req, callback) {
	var param = req.query['page'];
	var pageInfo = _.pick(param, 'offset', 'limit');
	if (pageInfo.offset !== undefined && pageInfo.limit !== undefined)
		callback(pageInfo);
}

module.exports = paginate;
