var assert = require('assert')
  , pluginable = require('../')

describe('Pluginable', function () {

  it('should error due to no plugins', function (done) {
    var pluginLoader = pluginable()

    pluginLoader.load(function (error) {
      assert.equal(error.message, 'No plugins found')

      done()
    })
  })

  it('should error due to missing name', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/invalid-name.js' ])

    pluginLoader.load(function (error) {
      assert.equal(error.message, 'No name defined in ' + __dirname + '/fixtures/invalid-name.js')

      done()
    })
  })

  it('should not error loading dependencies in any order', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/news-service.js', __dirname + '/fixtures/db.js' ])

    pluginLoader.load(function (error, plugins) {
      assert.ifError(error)

      assert(plugins.db)
      assert(plugins.newsService)

      done()
    })
  })

  it('should error due to circular dependencies', function (done) {
    var pluginLoader = pluginable( [ __dirname + '/fixtures/circular-a.js', __dirname + '/fixtures/circular-b.js' ])

    pluginLoader.load(function (error) {
      assert.equal(error.message, 'Circular dependencies detected for circularA, circularB')

      done()
    })
  })

  it('should load db', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.load(function (error) {
      assert.ifError(error)

      assert(pluginLoader.plugins.db)
      assert.equal(pluginLoader.plugins.db, 'database')

      done()
    })
  })

  it('should load async', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/async.js' ])

    pluginLoader.load(function (error) {
      assert.ifError(error)

      assert(pluginLoader.plugins.test)
      assert.equal(pluginLoader.plugins.test, 'hello')

      done()
    })
  })

  it('should error due to plugin error', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/load-error.js' ])

    pluginLoader.load(function (error) {
      assert.equal(error.message, 'test')

      done()
    })
  })

  it('should only register instance if truey', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/no-instance.js' ])

    pluginLoader.load(function (error) {
      assert.ifError(error)

      assert.equal(pluginLoader.plugins.noInstance, null)

      done()
    })
  })

  it('should allow registered plugins to act as a dependency before load', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/defined-dependencies.js' ])

    pluginLoader.registerBeforeLoad(function asd(cb) { cb(null, 'test') })

    pluginLoader.load(function (error) {
      assert.ifError(error)

      var plugins = pluginLoader.plugins

      assert(plugins.asd)

      done()
    })
  })

  it('should allow complicated dependency trees', function (done) {
    var pluginLoader = pluginable(
      [ __dirname + '/fixtures/complex/a.js'
      , __dirname + '/fixtures/complex/b.js'
      , __dirname + '/fixtures/complex/c.js'
      , __dirname + '/fixtures/complex/d.js'
      ])

    pluginLoader.load(function (error) {
      assert.ifError(error)

      var plugins = pluginLoader.plugins
        , a = plugins.a
        , b = plugins.b
        , c = plugins.c
        , d = plugins.d

      assert(a)
      assert(b)
      assert(c)
      assert(d)

      assert.equal(a, 'test')
      assert.equal(b, 'testb')
      assert.equal(c, 'testtestbc')
      assert.equal(d, 'testtestbcd')

      done()
    })
  })

  it('should allow soft dependencies', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/soft-depend.js', __dirname + '/fixtures/db.js' ])

    pluginLoader.load(function (error, plugins) {
      assert.ifError(error)

      assert(plugins.db)
      assert(plugins.softDependTest)

      assert.equal(plugins.softDependTest, 'databasetest')

      done()
    })
  })

  it('should return an undefined argument error', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/undefined-argument.js', __dirname + '/fixtures/no-instance.js' ])

    pluginLoader.load(function (error) {

      assert.equal(error.message, 'Undefined argument found for undefinedArg')

      done()
    })
  })

  it('should return a no callback defined error', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/no-callback.js' ])

    pluginLoader.load(function (error) {
      assert.equal(error.message, 'No callback argument found for noCallback')

      done()
    })
  })

  it('should not allow a plugin to be named register', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/invalid-register.js' ])

    pluginLoader.load(function (error) {
      assert.equal(error.message, 'Plugin cannot be named register')

      done()
    })
  })

  it('should return an unknown dependency error', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/news-service.js' ])

    pluginLoader.load(function (error) {
      assert.equal(error.message, 'newsService has an unknown dependency db')

      done()
    })
  })

  it('should return a duplicate error', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js', __dirname + '/fixtures/db.js' ])

    pluginLoader.load(function (error) {

      assert.equal(error.message, 'Duplicate plugin names detected db')

      done()
    })
  })

  it('should emit a beforeLoad event', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.once('beforeLoad', function (plugin) {
      assert(plugin)
      assert.equal(plugin.name, 'db')

      done()
    })

    pluginLoader.load(function () {})
  })

  it('should emit a plugin specific beforeLoad event', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.once('beforeLoad:db', function (plugin) {
      assert(plugin)
      assert.equal(plugin.name, 'db')

      done()
    })

    pluginLoader.load(function () {})
  })

  it('should emit an afterLoad event', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.once('afterLoad', function (plugin, instance) {
      assert(plugin)
      assert.equal(plugin.name, 'db')
      assert.equal(instance, 'database')

      done()
    })

    pluginLoader.load(function () {})
  })

  it('should emit a plugin specific afterLoad event', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.once('afterLoad:db', function (plugin, instance) {
      assert(plugin)
      assert.equal(plugin.name, 'db')
      assert.equal(instance, 'database')

      done()
    })

    pluginLoader.load(function () {})
  })

  it('should emit a beforeFinished event', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.once('beforeFinished', function (instances) {
      assert(instances)
      assert(instances.db)
      assert.equal(instances.db, 'database')

      done()
    })

    pluginLoader.load(function () {})
  })

  it('should emit an afterFinished event', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.on('afterFinished', function (instances) {
      assert(instances)
      assert(instances.db)
      assert.equal(instances.db, 'database')

      done()
    })

    pluginLoader.load(function () {})
  })

  it('should allow removal of all listeners', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.on('afterFinished', function () {
      done()
    })

    pluginLoader.removeAllListeners()

    pluginLoader.on('afterFinished', function () {
      done()
    })

    pluginLoader.load(function () {});

  })

  it('should throw an error when setting a plugin instance', function (done) {
    var pluginLoader = pluginable([ __dirname + '/fixtures/db.js' ])

    pluginLoader.load(function () {
      assert.throws(function () {
        pluginLoader.plugins.db = 'test'
      }, /You can not alter a loaded plugin/)

      done()
    })
  })

})
