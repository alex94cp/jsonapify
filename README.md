# jsonapify

[![NPM](https://nodei.co/npm/jsonapify.png?downloads=true)](https://nodei.co/npm/jsonapify/)

[![Build Status](https://travis-ci.org/alex94puchades/jsonapify.svg?branch=master)](https://travis-ci.org/alex94puchades/jsonapify)
[![Dependencies](https://david-dm.org/alex94puchades/jsonapify.svg)](https://david-dm.org/alex94puchades/jsonapify)
[![Coverage Status](https://coveralls.io/repos/alex94puchades/jsonapify/badge.svg?branch=master&service=github)](https://coveralls.io/github/alex94puchades/jsonapify?branch=master)
[![Gratipay Tips](https://img.shields.io/gratipay/AlexPuchades.svg)](https://gratipay.com/~AlexPuchades/)

jsonapify is a library to assist the development of JSON-API compatible APIs with NodeJS.

## Why jsonapify?

- __Simple__: jsonapify is designed around simplicity. *Easy things are easy to do, hard things are possible*. If you feel something can be made simpler, by all means [file an issue](https://github.com/alex94puchades/jsonapify/issues)!
- __Unintrusive__: ExpressJS, Restify, Connect,... No matter, jsonapify integrates nicely.
- __Interoperable__: By offering a common-interface across your APIs, jsonapify lets your users build great things on top of them. If you don't know yet about the JSON-API specification, you should [read about it](http://jsonapi.org/) and all the oportunities it has to offer.
- __Well tested__: jsonapify is designed from the start with unit testing in mind. Reliability is at the core of what we do.

## Declaring resources

jsonapify detaches mongoose models from the actual representation of the resources. This allows for a lot of flexibility: as a matter of fact, declaring a non-readable field is this elegant:

```js
var User = require('../models');
var userResource = new jsonapify.Resource(User, {
	'type': 'users',
	'id': new jsonapify.Property('_id'),
	'attributes': {
		'email': new jsonapify.Property('email'),
		'password': {
			value: new jsonapify.Property('password'),
			readable: false,
		},
	},
});
```

## Navigating resources

[HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) is one of the most important principles of the [REST](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) phylosophy. jsonapify makes interconnecting your resources a piece of cake:

```js
var User = require('../models');
var userResource = new jsonapify.Resource(User, {
	'type': 'users',
	'id': new jsonapify.Property('_id'),
	'links': {
		'self': {
			value: new jsonapify.Template('/users/${_id}'),
			writable: false,
		},
	},
});
```

## Linking resources

As someone said, "nobody is an island". Resources are not islands, either. Linking resources in jsonapify is as easy as you'd expect:

```js
var User = require('../models');
var roleResource = require('./roles').resource;
var userResource = new jsonapify.Resource(User, {
	'type': 'users',
	'id': new jsonapify.Property('_id'),
	'relationships': {
		'role': new jsonapify.Ref(roleResource, 'role'),
	},
});
```

## Exposing resources

We all know about [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). But then, why do we keep writing the same endpoint boilerplate again and again? jsonapify offers all [CRUD operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) as connect-compatible middleware. That means plugging a new endpoint is as simple as it gets:

```js
app.get('/users/', [
	jsonapify.enumerate(userResource),
	jsonapify.errorHandler()
]);
```

## Transaction filters

In addition to all of the above, jsonapify also offers **transaction filters**. These filters enable per-request functionality, such as [pagination](http://jsonapi.org/format/#fetching-pagination), [sparse-fields](http://jsonapi.org/format/#fetching-sparse-fieldsets), [sorting](http://jsonapi.org/format/#fetching-sorting)... Enabling them is just a matter of setting an option param: 

```js
app.get('/users/', [
	jsonapify.enumerate(userResource, { filters: jsonapify.paginate() }),
	jsonapify.errorHandler(),
]);
```

## Credits

This library wouldn't have been possible without all the great work by the people of the [JSON-API specification](http://jsonapi.org/). Thank you guys, you're awesome!
