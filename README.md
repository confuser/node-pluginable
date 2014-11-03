# pluginable

[![build status](https://secure.travis-ci.org/confuser/node-pluginable.png)](http://travis-ci.org/confuser/node-pluginable)

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
module.exports.name = 'pluginName/codeReference'
module.exports.init = function () {
  console.log('this is called on load')

  return 'thisIsMyPluginInstance'
}
```

### Dependencies
These can be inferred from the function arguments

```js
module.exports.name = 'theName'
module.exports.init = function (db, userService, app) {
  console.log(db, userService, app)
}
```

Alternatively, they can be defined as an export to be then used as a service locator like pattern
```js
var pluginable = require('pluginable')
module.exports.name = 'theName'
module.exports.dependencies = [ 'db', 'userService', 'app' ]
module.exports.init = function () {
  var plugins = pluginable.getPlugins()
  console.log(plugins.db, plugins.userService, plugins.app)
}
```


### Instances
These are returned within the init function, either via a normal return, or via an async callback(error, instance).
This is then what another plugin will be given if it is dependent on it.

#### Sync
```js
module.exports.name = 'theName'
module.exports.init = function (db, userService, app) {
  return function () { console.log('this is the plugin instance' )}
}
```

#### Async
```js
module.exports.name = 'theName'
module.exports.init = function (db, cb) {
  cb(null, { test: 'hello' })
}
```

The last argument named after any within ```lib/callback-names``` will be assumed to be callbacks.
This behaviour can easily be changed by exporting async.
if you wish to have a dependency object named callback for example

```js
module.exports.async = false
module.exports.name = 'theName'
module.exports.init = function (db, callback) {
  console.log(callback.test)
}
```

or if you wish to name your callback something completely different
```js
module.exports.async = true
module.exports.name = 'theName'
module.exports.init = function (db, theCallback) {
  theCallback(null, 'test')
}
```

## What if...

### I want to access other plugins but not be dependent on them?
```js
require('pluginable').getPlugins()['pluginName']
```
It should be noted that the idea of optional dependencies does not currently exist, therefore you should ensure your plugin is loaded in the correct order. Plugins with no dependencies will always be loaded first.

### I want to clear the plugins?
```js
require('pluginable').reset()
```
This should only be used in testing environments, as it does not allow plugins to clean up after themselves, meaning it may leave your process in an undesired state.


### I want to dynamically load a plugin instance after startup?
```js
var instance = {}
require('pluginable').getPlugins().register('theName', instance)
```
It should be noted that this will simply allow you to access the plugin instance via getPlugins(), and not via inferred dependencies.

### I want to dynamically load a plugin before startup?
```js
var plugin = { name: 'test', init: function () { return 'test' }}
require('pluginable').register(plugin)
```
This allows you to register plugins for use with a dependency before executing pluginable() for example a logger instance
