module.exports = function (fn) {
  var name = null

  if (!fn) return name

  // TODO optimise
  var names = fn
    .toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
    .match(/^function(\w*)/)

  if (!names || names.length !== 2 || !names[1]) return name

  name = names[1]

  return name
}
