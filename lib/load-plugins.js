var async = require('async')
  , getDependencyInstances = require('./get-dependency-instances')

module.exports = function (serviceLocator, plugins, dependencies, cb) {
  var loadedPlugins = []
    , totalPlugins = plugins.length

  async.whilst
  ( function () { return loadedPlugins.length !== totalPlugins }
  , pluginIterator
  , function (error) {
      cb(error, serviceLocator)
    })

  function pluginIterator(cb) {
    var missingDependency = true

    async.each(plugins, function (plugin, eachCb) {
      // Skip if loaded
      if (loadedPlugins.indexOf(plugin.name) !== -1) return eachCb()

      var pluginDependencies = dependencies[plugin.name]

      if (pluginDependencies) {
        pluginDependencies = pluginDependencies.filter(function (dependency) {
          return loadedPlugins.indexOf(dependency) === -1
        })

        if (pluginDependencies.length === 0) {
          delete dependencies[plugin.name]
        }

      }

      if (!dependencies[plugin.name]) {
        missingDependency = false
        loadAsync(plugin, eachCb)
      } else {
        eachCb()
      }

    } , function (error) {
      if (error) return cb(error)
      if (!missingDependency) return cb()

      var errorNames = plugins.map(function (plugin) {
        return plugin.name
      }).join(', ')

      cb(new Error('Circular dependencies detected for ' + errorNames))
    })
  }

  function loadAsync(plugin, cb) {
    var args = getDependencyInstances(serviceLocator, plugin).concat(function (error, instance) {
      if (error) return cb(error)

      // Only register if truey
      if (instance) {
        serviceLocator.register(plugin.name, instance)
      }

      loadedPlugins.push(plugin.name)

      cb()
    })
    , error = null

    args.forEach(function (arg) {
      if (typeof arg === 'undefined') error = new Error('Undefined argument found for ' + plugin.name)
    })

    if (error) return cb(error)

    plugin.apply(null, args)
  }
}
