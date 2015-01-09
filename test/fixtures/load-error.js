module.exports = function shouldError(cb) {
  cb(new Error('test'))
}
