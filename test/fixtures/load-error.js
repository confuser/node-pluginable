module.exports.name = 'shouldError'
module.exports.init = function (cb) {
  cb(new Error('test'))
}
