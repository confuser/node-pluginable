module.exports = function (serviceLocator, plugin) {
  if (!plugin.dependencies) return []

  var instances = []

  plugin.dependencies.forEach(function (name) {
    instances.push(serviceLocator[name])
  })

  return instances
}
