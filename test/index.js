// unit testing

var request = require('supertest')
var test = require('tape')

var app = require('../app')

test('First test!', function(t) {
    t.end()
})

function runTest(name, api, testfun){
    test(name, function(t) {
        request(app)
            .get(api)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                t.error(err, 'no error')
                testfun(res, t)
                t.end()
            })
    })
}

runTest('version', '/api/v1/version', function(res, t) {
    const pkg = require('../package.json')
    t.same(res.body, { name: pkg.name, version: pkg.version }, 'check body')
})

runTest('info', '/api/v1//', function(res, t) {
})

runTest('todo list', '/api/v1/todo', function(res, t) {
    t.equal(res.body.length, 20, 'rows returned')
})

runTest('todo item', '/api/v1/todo/1', function(res, t) {
    t.equal(res.body['title'], 'Fix open bugs', 'item 1 is fix open bugs')
})
