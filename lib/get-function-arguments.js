module.exports = function (fn) {
  var args = fn
    .toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
    .split(/,/)

  if (args.length === 1 && !args[0]) args = []

  return args
}
