module.exports = function circularA(circularB, cb) {
  cb(null, circularB)
}
