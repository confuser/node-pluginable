var async = require('async')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , preloadPlugins = require('./lib/preload-plugins')
  , loadPlugins = require('./lib/load-plugins')
  , validatePlugin = require('./lib/validate-plugin')
  , bondPlugin = require('./lib/bond-plugin')

function Pluginable(files) {
  this.files = files
  this.beforeLoad = []

  EventEmitter.call(this)
}

util.inherits(Pluginable, EventEmitter)

Pluginable.prototype.load = function(cb) {
  var self = this

  async.waterfall(
  [ function (cb) {
      if (!self.files || self.files.length === 0) return cb(new Error('No plugins found'))

      var plugins = []

      async.each(self.files, function (file, callback) {
        validatePlugin(file, function (error, plugin) {
          if (error) return callback(error)

          plugins.push(plugin)

          callback()
        })
      }, function (error) {
        plugins = plugins.concat(self.beforeLoad)
        self.beforeLoad = []

        cb(error, plugins)
      })
    }
  , preloadPlugins
  , loadPlugins.bind(self)
  ], function (error, instances) {
    if (error) return cb(error)

    self.emit('beforeFinished', instances)

    cb(null, instances)

    // Code smell?
    self.emit('afterFinished', instances)
  })
}

Pluginable.prototype.registerBeforeLoad = function (plugin) {
  this.beforeLoad.push(plugin)
}

// Essentially bind, but don't want to override it in case of unexpected behaviour by other developers
// Should only really be used after plugins have finished loading
Pluginable.prototype.bond = function (plugin) {
  return bondPlugin.call(this, plugin)
}

module.exports = function (files) {
  return new Pluginable(files)
}
