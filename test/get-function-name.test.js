var should = require('should')
  , getFnName = require('../lib/get-function-name')

describe('Get Function Name', function () {
  it('should get function name', function () {
    var name = getFnName(function test(hello, that, is, an, argument) { argument() })

    name.should.equal('test')
  })

  it('should ignore spaces', function () {
    var name = getFnName(function test (hello, /*that, is,*/ an, argument) { argument() })

    name.should.equal('test')
  })

  it('should return null for anonymous', function () {
    var name = getFnName(function (hello, that, is, an, argument) { argument() })

    should.equal(name, null)
  })

  it('should handle non-functions', function () {
    should.equal(getFnName([ 1 ]), null)
    should.equal(getFnName({ test: 1 }), null)
  })

  it('should return null for no function', function () {
    var name = getFnName()

    should.equal(name, null)
  })
})
