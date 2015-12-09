var async = require('async')
  , getDependencyInstances = require('./get-dependency-instances')

module.exports = function (plugins, dependencies, cb) {
  var loadedPlugins = []
    , totalPlugins = plugins.length
    , self = this
    , serviceLocator = {}

  this.plugins = serviceLocator

  async.whilst
  ( function () { return loadedPlugins.length !== totalPlugins }
  , pluginIterator
  , function (error) {
      cb(error, serviceLocator)
    })

  function pluginIterator(cb) {
    var missingDependency = true

    async.each(plugins, async.ensureAsync(function (plugin, eachCb) {
      // Skip if loaded
      if (loadedPlugins.indexOf(plugin.name) !== -1) return eachCb()

      var pluginDependencies = dependencies[plugin.name].filter(function (dependency) {
        return loadedPlugins.indexOf(dependency) === -1
      })

      if (pluginDependencies.length === 0) {
        delete dependencies[plugin.name]
      }

      if (!dependencies[plugin.name]) {
        missingDependency = false
        loadAsync(plugin, eachCb)
      } else {
        eachCb()
      }

    }) , function (error) {
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
        Object.defineProperty(serviceLocator, plugin.name
          , { configurable: false
            , enumerable: true
            , get: function () { return instance }
            , set: function () { throw new Error('You can not alter a loaded plugin')}
            })
      }

      loadedPlugins.push(plugin.name)
      self.emit('afterLoad', plugin, instance)
      self.emit('afterLoad:' + plugin.name, plugin, instance)

      cb()
    })
    , error = null

    args.forEach(function (arg) {
      if (typeof arg === 'undefined') error = new Error('Undefined argument found for ' + plugin.name)
    })

    if (error) return cb(error)

    self.emit('beforeLoad', plugin)
    self.emit('beforeLoad:' + plugin.name, plugin)

    plugin.apply(self, args)
  }
}
