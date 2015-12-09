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

glob('./**/pluginable.js', funcion (error, files) {
  var pluginLoader = pluginable(files)

  pluginLoader.load(function (error) {
    console.log('Plugins loaded')
  })
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

## Events
Registered before pluginable is initialised, or within a plugin itself via `on` or `once`.

Only emitted if no errors, e.g. an afterLoad will not emit if a plugin returns an error.

```js
var pluginable = require('pluginable')
var pluginLoader = pluginable(files)

pluginLoader.on('beforeLoad', function (plugin) {
  console.log(plugin.name)
})

pluginLoader.load(function (error) {
  console.log('Plugins loaded')
})
```

```js
module.exports = function pluginName() {
  this.on('eventName', function () { })
}
```

* `beforeLoad(plugin)` - Emitted before each plugin is loaded.

* `beforeLoad:pluginName(plugin)` - Emitted before the specified plugin is loaded.

* `afterLoad(plugin, instance)` - Emitted after each plugin is loaded.

* `afterLoad:pluginName(plugin, instance)` - Emitted after the specified plugin is loaded.

* `beforeFinished(pluginInstances)` - Emitted before the pluginable callback is called.

* `afterFinished(pluginInstances)` - Emitted after the pluginable callback is called.

## What if...

### I want to access other plugins but not be dependent on them?
```js
module.exports = function theName(db, cb) {
  // Will output instance value of 'test' if present
  console.log(this.plugins.test)
  cb(null, { test: 'hello' })
}
module.exports.softDepend = [ 'test' ]
```

### I want to clear the plugins?
Pluginable is newless OO. Allowing the reference to be garbage collected should suffice.

### I want to dynamically load a plugin before startup?
```js
var pluginLoader = require('pluginable')(files)
pluginLoader.registerBeforeLoad(function test(cb) { cb() })

pluginLoader.load(function (error, plugins) {
  console.log(error, plugins)
})
```
This allows you to register plugins for use with a dependency before executing load(), for example a logger instance.

### I want to use this pattern with other functions after load?
```js
var pluginLoader = require('pluginable')(files)

pluginLoader.load(function (error, plugins) {
  var fn = pluginLoader.bond(function hello(pluginA, pluginB) {
    console.log(pluginA, pluginB)
  })

  fn()
})
```
Note, `bond` will throw an error if a dependency is unmet.

### I have plugins with circular dependencies?
Pluginable will return an error stating which plugins are affected and will not continue until it is solved.

### I have a plugin dependency that isn't present?
Pluginable will return an error stating which dependency is missing and from which plugin.

### I try to break it?
Pluginable tries to validate plugins before loading or using them. If you're really evil and come across a scenario that isn't covered, feel free to open an issue.
