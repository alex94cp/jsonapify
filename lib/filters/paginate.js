var common = require('./common');

function paginate(strategy) {
	return common.createFilter(strategy.queryParser, strategy.handler);
}

module.exports = paginate;
