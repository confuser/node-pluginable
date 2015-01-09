var getFnName = require('./get-function-name')

module.exports = function (file, cb) {
  var plugin = require(file)
    , error = null

  plugin.name = getFnName(plugin)

  if (!plugin.name) {
    error = new Error('No name defined in ' + file)
  } else if (plugin.name === 'register') {
    error = new Error('Plugin cannot be named register')
  }

  cb(error, plugin)
}
