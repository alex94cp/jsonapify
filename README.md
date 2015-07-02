# jsonapify

Middleware for easy development of JSON-API compatible APIs

## Install

```bash
$ npm install jsonapify
```

## Sample code

```js
var auth = require('./auth');
var express = require('express');
var jsonapify = require('jsonapify');

var User = require('./models/user');
var roleResource = require('./roles').Resource;
var userResource = new jsonapify.resource(User, {
	type: 'users',
	id: jsonapify.field('_id'),
	attributes: {
		email: jsonapify.field('email'),
		password: jsonapify.field('password', { readable: false }),
	},
	relationships: {
		role: jsonapify.ref(roleResource, 'role'),
	},
});

var router = express.Router();
router.get('/', jsonapify.enumerate(userResource, {
	middleware: [
		auth.authenticateAccessToken(),
		auth.requirePrivilege('user:enum'),
		jsonapify.errorHandler(),
	],
});

module.exports = exports = router;
exports.Resource = userResource;
```
