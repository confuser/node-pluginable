var should = require('should')
  , pluginable = require('../')

describe('Pluginable', function () {

  it('should error due to no plugins', function (done) {
    // Yuck coffee :D
    pluginable('*.coffee', function (error) {
      should.exist(error)
      error.message.should.equal('No pluginables found')

      done()
    })
  })

  it('should error due to missing name', function (done) {
    pluginable(__dirname + '/fixtures/invalid-name.js', function (error) {
      should.exist(error)
      error.message.should.equal('No name defined in ' + __dirname + '/fixtures/invalid-name.js')

      done()
    })
  })

  it('should not error loading dependencies in any order', function (done) {
    pluginable([ __dirname + '/fixtures/news-service.js', __dirname + '/fixtures/db.js' ], function (error, plugins) {
      should.not.exist(error)

      should.exist(plugins.db)
      should.exist(plugins.newsService)

      done()
    })
  })

  it('should error due to circular dependencies', function (done) {
    pluginable(__dirname + '/fixtures/circular-*.js', function (error) {
      should.exist(error)
      error.message.should.equal('Circular dependencies detected for circularA, circularB')

      done()
    })
  })

  it('should load db', function (done) {
    pluginable(__dirname + '/fixtures/db.js', function (error) {
      should.not.exist(error)

      should.exist(pluginable.getPlugins().db)
      pluginable.getPlugins().db.should.equal('database')

      done()
    })
  })

  it('should load async', function (done) {
    pluginable(__dirname + '/fixtures/async.js', function (error) {
      should.not.exist(error)

      should.exist(pluginable.getPlugins().test)
      pluginable.getPlugins().test.should.equal('hello')

      done()
    })
  })

  it('should error due to plugin error', function (done) {
    pluginable(__dirname + '/fixtures/load-error.js', function (error) {
      should.exist(error)
      error.message.should.equal('test')

      done()
    })
  })

  it('should only register instance if truey', function (done) {
    pluginable(__dirname + '/fixtures/no-instance.js', function (error) {
      should.not.exist(error)

      should.not.exist(pluginable.getPlugins().noInstance)

      done()
    })
  })

  it('should allow registered plugins to act as a dependency before load', function (done) {
    pluginable.registerBeforeLoad(function asd(cb) { cb(null, 'test') })
    pluginable(__dirname + '/fixtures/defined-dependencies.js', function (error) {
      should.not.exist(error)

      var plugins = pluginable.getPlugins()

      should.exist(plugins.asd)

      done()
    })
  })

  it('should allow complicated dependency trees', function (done) {
    pluginable(__dirname + '/fixtures/complex/*.js', function (error) {
      should.not.exist(error)

      var plugins = pluginable.getPlugins()
        , a = plugins.a
        , b = plugins.b
        , c = plugins.c
        , d = plugins.d

      should.exist(a)
      should.exist(b)
      should.exist(c)
      should.exist(d)

      a.should.equal('test')
      b.should.equal('testb')
      c.should.equal('testtestbc')
      d.should.equal('testtestbcd')

      done()
    })
  })

  it('should allow soft dependencies', function (done) {
    pluginable([ __dirname + '/fixtures/soft-depend.js', __dirname + '/fixtures/db.js' ], function (error, plugins) {
      should.not.exist(error)

      should.exist(plugins.db)
      should.exist(plugins.softDependTest)

      plugins.softDependTest.should.equal('databasetest')

      done()
    })
  })

  it('should return an undefined argument error', function (done) {
    pluginable([ __dirname + '/fixtures/undefined-argument.js', __dirname + '/fixtures/no-instance.js' ], function (error) {
      should.exist(error)

      error.message.should.equal('Undefined argument found for undefinedArg')

      done()
    })
  })

  it('should return a no callback defined error', function (done) {
    pluginable(__dirname + '/fixtures/no-callback.js', function (error) {
      should.exist(error)
      error.message.should.equal('No callback argument found for noCallback')

      done()
    })
  })

  it('should not allow a plugin to be named register', function (done) {
    pluginable(__dirname + '/fixtures/invalid-register.js', function (error) {
      should.exist(error)
      error.message.should.equal('Plugin cannot be named register')

      done()
    })
  })

  it('should return an unknown dependency error', function (done) {
    pluginable(__dirname + '/fixtures/news-service.js', function (error) {
      should.exist(error)
      error.message.should.equal('newsService has an unknown dependency db')

      done()
    })
  })

  it('should return a duplicate error', function (done) {
    pluginable([ __dirname + '/fixtures/db.js', __dirname + '/fixtures/db.js' ], function (error) {
      should.exist(error)

      error.message.should.equal('Duplicate plugin names detected db')

      done()
    })
  })

  it('should emit a beforeLoad event', function (done) {
    pluginable.once('beforeLoad', function (plugin) {
      should.exist(plugin)
      plugin.name.should.equal('db')

      done()
    })

    pluginable(__dirname + '/fixtures/db.js', function () {})
  })

  it('should emit a plugin specific beforeLoad event', function (done) {
    pluginable.once('beforeLoad:db', function (plugin) {
      should.exist(plugin)
      plugin.name.should.equal('db')

      done()
    })

    pluginable(__dirname + '/fixtures/db.js', function () {})
  })

  it('should emit an afterLoad event', function (done) {
    pluginable.once('afterLoad', function (plugin, instance) {
      should.exist(plugin)
      plugin.name.should.equal('db')
      instance.should.equal('database')

      done()
    })

    pluginable(__dirname + '/fixtures/db.js', function () {})
  })

  it('should emit a plugin specific afterLoad event', function (done) {
    pluginable.once('afterLoad:db', function (plugin, instance) {
      should.exist(plugin)
      plugin.name.should.equal('db')
      instance.should.equal('database')

      done()
    })

    pluginable(__dirname + '/fixtures/db.js', function () {})
  })

  it('should emit a beforeFinished event', function (done) {
    pluginable.once('beforeFinished', function (instances) {
      should.exist(instances)
      should.exist(instances.db)
      instances.db.should.equal('database')

      done()
    })

    pluginable(__dirname + '/fixtures/db.js', function () {})
  })

  it('should emit an afterFinished event', function (done) {
    pluginable.on('afterFinished', function (instances) {
      should.exist(instances)
      should.exist(instances.db)
      instances.db.should.equal('database')

      done()
    })

    pluginable(__dirname + '/fixtures/db.js', function () {})
  })

  it('should allow removal of all listeners', function (done) {
    pluginable.on('afterFinished', function () {
      done()
    })

    pluginable.removeAllListeners()

    pluginable.on('afterFinished', function () {
      done()
    })

    pluginable(__dirname + '/fixtures/db.js', function () {})
  })

})
