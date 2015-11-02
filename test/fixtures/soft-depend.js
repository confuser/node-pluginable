module.exports = function softDependTest(cb) {
  cb(null, this.plugins.db + 'test')
}

module.exports.softDepend = [ 'db' ]
