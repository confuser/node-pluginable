module.exports = function circularB(circularA, cb) {
  cb(null, circularA)
}
