var should = require('should')
  , pluginable = require('../')

describe('Pluginable', function () {
  afterEach(function () {
    pluginable.reset()
  })

  it('should error due to missing name', function (done) {
    pluginable('./test/fixtures/invalid-name.js', function (error) {
      should.exist(error)
      error.message.should.equal('No name defined in ./test/fixtures/invalid-name.js')

      done()
    })
  })

  it('should error due to non-function', function (done) {
    pluginable('./test/fixtures/invalid-export.js', function (error) {
      should.exist(error)
      error.message.should.equal('Expected an exported init function in ./test/fixtures/invalid-export.js')

      done()
    })
  })

  it('should error due to missing dependency', function (done) {
    pluginable('./test/fixtures/news-service.js', function (error) {
      should.exist(error)
      error.message.should.equal('newsService has an unknown dependency db')

      done()
    })
  })

  it('should error due to missing dependencies', function (done) {
    pluginable('./test/fixtures/defined-dependencies.js', function (error) {
      should.exist(error)
      error.message.should.equal('manyDeps has an unknown dependency asd')

      done()
    })
  })

  it('should error due to circular dependencies', function (done) {
    pluginable('./test/fixtures/circular-*.js', function (error) {
      should.exist(error)
      error.message.should.equal('Possible circular dependency detected for circularA,circularB')

      done()
    })
  })

  it('should load db', function (done) {
    pluginable('./test/fixtures/db.js', function (error) {
      should.not.exist(error)

      should.exist(pluginable.getPlugins().db)
      pluginable.getPlugins().db.should.equal('database')

      done()
    })
  })

  it('should load sync', function (done) {
    pluginable('./test/fixtures/sync.js', function (error) {
      should.not.exist(error)

      should.exist(pluginable.getPlugins().test)
      pluginable.getPlugins().test.should.equal('hello')

      done()
    })
  })

  it('should load async', function (done) {
    pluginable('./test/fixtures/async.js', function (error) {
      should.not.exist(error)

      should.exist(pluginable.getPlugins().test)
      pluginable.getPlugins().test.should.equal('hello')

      done()
    })
  })

  it('should error due to plugin error', function (done) {
    pluginable('./test/fixtures/load-error.js', function (error) {
      should.exist(error)
      error.message.should.equal('test')

      done()
    })
  })

  it('should only register instance if truey', function (done) {
    pluginable('./test/fixtures/no-instance.js', function (error) {
      should.not.exist(error)

      should.not.exist(pluginable.getPlugins().noInstance)

      done()
    })
  })

  it('should not allow registered plugins to act as a dependency before load', function (done) {
    pluginable.getPlugins().register('asd', {})
    pluginable('./test/fixtures/defined-dependencies.js', function (error) {
      should.exist(error)

      error.message.should.equal('manyDeps has an unknown dependency asd')

      done()
    })
  })

})
