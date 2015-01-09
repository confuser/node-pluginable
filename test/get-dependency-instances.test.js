var createServiceLocator = require('service-locator')
  , getDependencyInstances = require('../lib/get-dependency-instances')

describe('Get Dependency Instances', function () {
  it('should return an empty array', function () {
    var deps = getDependencyInstances(createServiceLocator(), {})

    deps.length.should.equal(0)
  })

  it('should return dependency instances', function () {
    var serviceLocator = createServiceLocator()

    serviceLocator.register('test', 'hello')
    serviceLocator.register('test2', 'foobar')

    var deps = getDependencyInstances(serviceLocator, { dependencies: [ 'test', 'test2' ] })

    deps.length.should.equal(2)
    deps[0].should.equal('hello')
    deps[1].should.equal('foobar')

  })
})
