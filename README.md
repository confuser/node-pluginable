# pluginable

[![build status](https://secure.travis-ci.org/confuser/node-pluginable.png)](http://travis-ci.org/confuser/node-pluginable)
[![Coverage Status](https://coveralls.io/repos/confuser/node-pluginable/badge.png?branch=master)](https://coveralls.io/r/confuser/node-pluginable?branch=master)


A component/module/plugin loader

## Installation

```
npm install pluginable --save
```

## Usage
```js
var pluginable = require('pluginable')
  , globList = './**/pluginable.js'

pluginable(globList, function (error) {
  console.log('Plugins loaded')
})
```

## Plugin Interface
```js
module.exports = function theName(cb) {
  console.log('this is called on load')

  cb(null)
}
```

### Dependencies
These can be inferred from the function arguments

```js
module.exports = function theName(db, userService, app, cb) {
  console.log(db, userService, app)
}
```

### Instances
These are returned within the function via an async callback(error, instance).
This is then what another plugin will be given if it is dependent on it based on the function name.

#### Async
```js
module.exports = function theName(db, cb) {
  cb(null, { test: 'hello' })
}
```

The last argument of your function will always be assumed to be the callback(error, [instance])


Note: The plugin will only be registered if the returned instance is truey

## What if...

### I want to access other plugins but not be dependent on them?
```js
var pluginable = require('pluginable')

module.exports = function theName(db, cb) {
  // Will output instance value of 'test' if present
  console.log(pluginable.getPlugins().test)
  cb(null, { test: 'hello' })
}
module.exports.softDepend = [ 'test' ]
```

### I want to clear the plugins?
Initalise pluginable(globList, cb) again.
This should only be used in testing environments, as it does not allow plugins to clean up after themselves, meaning it may leave your process in an undesired state.

### I want to dynamically load a plugin before startup?
```js
require('pluginable').registerBeforeLoad(function test(cb) { cb() })
```
This allows you to register plugins for use with a dependency before executing pluginable() for example a logger instance.
