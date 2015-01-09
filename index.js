var glob = require('glob')
  , async = require('async')
  , preloadPlugins = require('./lib/preload-plugins')
  , loadPlugins = require('./lib/load-plugins')
  , validatePlugin = require('./lib/validate-plugin')
  , beforeLoad = []
  , createServiceLocator = require('service-locator')
  , serviceLocator

module.exports = function (list, cb) {
  serviceLocator = createServiceLocator()

  // TODO Don't assume it is a glob, allow other options!
  async.waterfall(
  [ function (cb) {
      if (Array.isArray(list)) {
        var files = []
        async.each(list, function (pattern, eachCb) {
          glob(pattern, function (error, found) {
            files = files.concat(found)
            eachCb(error)
          })
        }, function (error) {
          cb(error, files)
        })
      } else {
        glob(list, cb)
      }
    }
  , function (files, cb) {
      if (!files || files.length === 0) return cb(new Error('No pluginables found'))

      var plugins = []

      async.each(files, function (file, callback) {
        validatePlugin(file, function (error, plugin) {
          if (error) return callback(error)

          plugins.push(plugin)

          callback()
        })
      }, function (error) {
        plugins = plugins.concat(beforeLoad)
        beforeLoad = []

        cb(error, plugins)
      })
    }
  , preloadPlugins
  , loadPlugins.bind(null, serviceLocator)
  ], function (error, instances) {
    if (error) return cb(error)

    serviceLocator = instances

    cb(null, instances)
  })
}

module.exports.getPlugins = function () {
  return serviceLocator
}

module.exports.registerBeforeLoad = function (plugin) {
  beforeLoad.push(plugin)
}
