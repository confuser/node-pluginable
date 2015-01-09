var pluginable = require('../../')

module.exports = function softDependTest(cb) {
  cb(null, pluginable.getPlugins().db + 'test')
}

module.exports.softDepend = [ 'db' ]
