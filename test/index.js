// index.js -- unit testing master

var request = require('supertest')
var test = require('tape')

test('First test!', t => {
    t.end()
})

require('./suite1')
require('./suite2')
require('./suite3')

test('Last test!', t => {
    t.end()
})
