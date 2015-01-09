var should = require('should')
  , getFnArguments = require('../lib/get-function-arguments')

describe('Get Function Arguments', function () {
  it('should get basic function arguments', function () {
    var args = getFnArguments(function test(hello, that, is, an, argument) { argument() })

    should.deepEqual(args, [ 'hello', 'that', 'is', 'an', 'argument' ])
  })

  it('should ignore comments', function () {
    var args = getFnArguments(function test(hello, /*that, is,*/ an, argument) { argument() })

    should.deepEqual(args, [ 'hello', 'an', 'argument' ])
  })

  it('should ignore break lines', function () {
    var args = getFnArguments(function test(hello
      , that, is
      , an
      , argument) { argument() })

    should.deepEqual(args, [ 'hello', 'that', 'is', 'an', 'argument' ])
  })

  it('should not return any arguments', function () {
    var args = getFnArguments(function test() { })

    should.deepEqual(args, [])
  })
})
