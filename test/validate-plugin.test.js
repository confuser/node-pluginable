var should = require('should')
  , validate = require('../lib/validate-plugin')

describe('Validate Plugin', function () {
  it('should return an error if missing name', function (done) {
    validate(__dirname + '/fixtures/invalid-name', function (error) {
      should.exist(error)
      error.message.should.equal('No name defined in ' + __dirname + '/fixtures/invalid-name')

      done()
    })
  })

})
