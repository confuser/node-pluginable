module.exports.name = 'test'
module.exports.async = true
module.exports.init = function (test) {
  test(null, 'hello')
}
