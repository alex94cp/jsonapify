var common = require('./common');

var _ = require('lodash');

function paginate() {
	return common.createFilter(queryParser, function(transaction, req, type, params) {
		var pageNumber = params.number, pageSize = params.size;

		transaction.subscribe(type, 'query', function(resource, query) {
			query.skip((pageNumber - 1) * pageSize).limit(pageSize);
		});

		transaction.subscribe(type, 'end', function(resource) {
			var selfLink = req.originalUrl;
			var response = transaction.response;
			var count = response.meta['count'];
			var pageCount = Math.ceil(count / pageSize);
			response.links['first'] = common.modifyQuery(selfLink, { page: { number: 1 }});
			response.links['last'] = common.modifyQuery(selfLink, { page: { number: pageCount }});
			if (pageNumber > 1)
				response.links['prev'] = common.modifyQuery(selfLink, { page: { number: pageNumber - 1 }});
			if (pageNumber < pageCount)
				response.links['next'] = common.modifyQuery(selfLink, { page: { number: pageNumber + 1 }});
		});
	});
}

function queryParser(req, callback) {
	var param = req.query['page'];
	var pageInfo = _.pick(param, 'size', 'number');
	if (pageInfo.size !== undefined && pageInfo.number !== undefined)
		callback(pageInfo);
}

module.exports = paginate;
