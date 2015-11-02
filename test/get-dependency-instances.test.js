var createServiceLocator = require('service-locator')
  , assert = require('assert')
  , getDependencyInstances = require('../lib/get-dependency-instances')

describe('Get Dependency Instances', function () {
  it('should return an empty array', function () {
    var deps = getDependencyInstances(createServiceLocator(), {})

    assert.equal(deps.length, 0)
  })

  it('should return dependency instances', function () {
    var serviceLocator = createServiceLocator()

    serviceLocator.register('test', 'hello')
    serviceLocator.register('test2', 'foobar')

    var deps = getDependencyInstances(serviceLocator, { dependencies: [ 'test', 'test2' ] })

    assert.equal(deps.length, 2)
    assert.equal(deps[0], 'hello')
    assert.equal(deps[1], 'foobar')

  })
})
