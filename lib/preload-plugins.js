var async = require('async')
  , findDuplicates = require('array-duplicated')
  , validateDependencies = require('./validate-dependencies')

module.exports = function (plugins, cb) {
  var dependencies = {}
    , pluginNames = plugins.map(function (plugin) { return plugin.name })
    , duplicates = findDuplicates(pluginNames)

  if (duplicates.length > 0) {
    return cb(new Error('Duplicate plugin names detected ' + duplicates.join(', ')))
  }

  async.waterfall(
  [ function (callback) {
      async.each(plugins, validateDependencies.bind(null, pluginNames), callback)
    }
  , function (callback) {
      plugins.forEach(function (plugin) {
        if (plugin.dependencies && plugin.dependencies.length > 0) {
          dependencies[plugin.name] = plugin.dependencies
        } else {
          dependencies[plugin.name] = []
        }

        if (plugin.softDepend && plugin.softDepend.length > 0) {
          dependencies[plugin.name] = dependencies[plugin.name].concat(plugin.softDepend)
        }

      })

      callback()
    }
  ], function (error) {
    if (error) return cb(error)

    cb(null, plugins, dependencies)
  })
}
