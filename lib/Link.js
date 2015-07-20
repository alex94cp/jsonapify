var _ = require('lodash');

function Link(href, meta) {
	if (_.isPlainObject(href) && !meta) {
		var link = href;
		href = link.href;
		meta = link.meta;
	}
	this._href = href || '';
	this._meta = meta || {};
}

Object.defineProperty(Link.prototype, 'href', {
	get: function() { return this._href; },
	set: function(href) { this._href = href; },
});

Object.defineProperty(Link.prototype, 'meta', {
	get: function() { return this._meta; },
});

Link.prototype.toJSON = function() {
	if (_.isEmpty(this._meta))
		return this._href;
	return {
		href: this._href,
		meta: this._meta,
	};
};

module.exports = Link;
