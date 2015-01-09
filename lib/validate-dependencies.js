var getFnArgs = require('./get-function-arguments')

module.exports = function (pluginNames, plugin, callback) {
  /* jshint maxcomplexity: 7 */
  var error = null

  plugin.dependencies = getFnArgs(plugin)

  if (plugin.dependencies.length === 0) {
    return callback(new Error('No callback argument found for ' + plugin.name))
  }

  // Remove the callback as a dependency
  plugin.dependencies.pop()

  if (plugin.dependencies.length > 0) {

    plugin.dependencies.forEach(function (dependency) {
      if (pluginNames.indexOf(dependency) === -1) {
        error = new Error(plugin.name + ' has an unknown dependency ' + dependency)
        return
      }
    })
  }

  if (error) return callback(error)
  if (!plugin.softDepend || plugin.softDepend.length === 0) return callback()

  plugin.softDepend.filter(function (dependency) {
    return pluginNames.indexOf(dependency) !== -1
  })

  callback(error)
}
