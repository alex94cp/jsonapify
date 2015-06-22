module.exports = exports = require('./resource');

exports.field = require('./accessors/field');
exports.const = require('./accessors/const');

exports.initialize = require('./middleware/initialize');
exports.enumerate = require('./middleware/enumerate');
exports.read = require('./middleware/read');
exports.update = require('./middleware/update');
