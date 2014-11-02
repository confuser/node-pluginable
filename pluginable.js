var glob = require('glob')
  , async = require('async')
  , union = require('lodash.union')
  , serviceLocator = require('service-locator')()
  , callbackNames = require('./lib/callback-names')
  , pluginables = {}
  , pluginNames = []

module.exports = function (list, cb) {
  // TODO Don't assume it is a glob, allow other options!
  async.waterfall(
  [ glob.bind(null, list)
  , handleFiles
  , discoverDependencies
  , validateDependencies
  , handleDependencies
  , load
  ], cb)
}

// Mainly for tests!
module.exports.reset = function () {
  pluginables = {}
  pluginNames = []
  serviceLocator = require('service-locator')()
}

module.exports.getPlugins = function () {
  return serviceLocator
}

function handleFiles(files, cb) {
  async.each(files, function (file, callback) {
    validatePlugin(file, function (error, plugin) {
      if (error) return callback(error)

      // Plugin is valid, so add it to the list
      pluginables[plugin.name] = plugin
      pluginNames.push(plugin.name)

      callback()
    })
  }, cb)

}

function validatePlugin(file, cb) {
  var plugin = require(file)
    , error = null

  if (!plugin.name) {
    error = new Error('No name defined in ' + file)
  } else if (typeof plugin.init !== 'function') {
    error = new Error('Expected an exported init function in ' + file)
  }
  // TODO Add more validation checks

  cb(error, plugin)
}

function discoverDependencies(cb) {
  async.each(pluginNames, function (name, callback) {
    var plugin = pluginables[name]

    if (plugin.dependencies && Array.isArray(plugin.dependencies)) {
      return callback()
    }

    // TODO move into own file for tests
    plugin.dependencies = plugin.init.toString()
      .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
      .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
      .split(/,/)

    if (plugin.dependencies.length === 1 && plugin.dependencies[0] === '') {
      plugin.dependencies = null
    }

    callback()
  }, cb)
}

function validateDependencies(cb) {
  async.each(pluginNames, function (name, callback) {
    var plugin = pluginables[name]
      , error = null

    if (!plugin.dependencies || plugin.dependencies.length === 0) return callback()

    if (plugin.async) {
      plugin.dependencies.pop()
    } else if (typeof plugin.async === 'undefined') {
      var lastArg = plugin.dependencies[plugin.dependencies.length - 1]

      if (callbackNames.indexOf(lastArg) !== -1) {
        plugin.async = true
        plugin.dependencies.pop()
      }
    }

    plugin.dependencies.forEach(function (dependency) {
      if (pluginNames.indexOf(dependency) === -1) {
        error = new Error(name + ' has an unknown dependency ' + dependency)
        return
      }
    })

    callback(error)
  }, cb)
}

function handleDependencies(cb) {
  // TODO Look into tree structure for parallel loading where possible
  var loadOrder = []
    , toCheck = pluginNames.slice()
    , dependencies = []
    , error = null

  // TODO Optimise
  pluginNames.forEach(function (name, i) {
    // Load non-dependent first
    var plugin = pluginables[name]

    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      loadOrder.push(name)
      toCheck.splice(i, 1)
    }
  })

  toCheck.forEach(function (name) {
    var plugin = pluginables[name]

    dependencies.push(plugin.dependencies.concat(name))
  })

  loadOrder = union(null, loadOrder.concat(dependencies))

  // Circular check
  loadOrder.forEach(function (name) {
    if (Array.isArray(name)) {
      error = new Error('Possible circular dependency detected for ' + name)
    }
  })

  cb(error, loadOrder)

}

function load(loadOrder, cb) {
  async.eachSeries(loadOrder, function (name, callback) {
    var plugin = pluginables[name]

    if (plugin.async) {
      loadAsync(plugin, callback)
    } else {
      loadSync(plugin)
      callback()
    }
  }, cb)
}

function getDependencyInstances(plugin) {
  if (!plugin.dependencies) return []

  var instances = []

  plugin.dependencies.forEach(function (name) {
    instances.push(serviceLocator[name])
  })

  return instances
}

function loadAsync(plugin, cb) {
  var args = getDependencyInstances(plugin).concat(function (error, instance) {
    if (error) return cb(error)

    serviceLocator.register(plugin.name, instance)

    cb()
  })

  plugin.init.apply(null, args)
}

function loadSync(plugin) {
  var args = getDependencyInstances(plugin)
    , instance = plugin.init.apply(args)

  serviceLocator.register(plugin.name, instance)
}
