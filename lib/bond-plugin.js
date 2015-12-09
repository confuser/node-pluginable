var getDependencyInstances = require('./get-dependency-instances')
  , getFnArgs = require('./get-function-arguments')
  , getFnName = require('./get-function-name')

module.exports = function (plugin) {
  var bound = plugin.bind(this) // Bind pluginable

  bound.dependencies = getFnArgs(plugin)
  bound.name = getFnName(bound)

  if (bound.dependencies.length === 0) return bound

  var error

  bound.dependencies.forEach(function (dependency) {
    if (this.plugins[dependency] === undefined) {
      error = bound.name + ' has an unknown dependency ' + dependency
    }
  }.bind(this))

  if (error) throw new Error(error)

  var args = getDependencyInstances(this.plugins, bound)

  return bound.bind.apply(bound, [ this ].concat(args))
}
