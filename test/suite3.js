// suite2 -- unit testing

var request = require('supertest')
var test = require('tape')

var app = require('../app')

// all tests use this common structure
function runTestResponse(name, api, testfun) {
    test(name + ' api:' + api, t => {
        request(app)
            .get(api)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                t.error(err, 'no error')
                testfun(res, t)
                t.end()
            })
    })
}


runTestResponse('todo chart category', '/api/v1/todo/chart/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
})

runTestResponse('todo chart priority', '/api/v1/todo/chart/priority', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
})

runTestResponse('todo chart complete', '/api/v1/todo/chart/complete', (res, t) => {
    //t.equal(res.body.length, 2, 'rows returned')
    t.equal(res.body.length, 3, 'rows returned')  // including Unknown
    let row0 = res.body[0]
})
