// index.js -- unit testing master

var request = require('supertest')
var test = require('tape')

var runtest = require('./common')

test('First test!', t => {
    t.end()
})

// require('./suite1')
// require('./suite2')
// require('./suite3')

runtest.GetOk('table list', '/api/v1/table', (res, t) => {
    t.equal(res.body.length, 19, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0._full_count, 19, 'full count')
    t.equal(row0.name, 'comics', 'first item name')
})

test('Last test!', t => {
    t.end()
})
