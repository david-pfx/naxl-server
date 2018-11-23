// suite2 -- unit testing

var request = require('supertest')
var test = require('tape')

var app = require('../app')

// all tests use this common structure
function runTestGetOk(name, api, testfun) {
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

function runTestDeleteOk(name, api, testfun) {
    test(name + ' api:' + api, t => {
        request(app)
            .delete(api)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                t.error(err, 'no error')
                testfun(res, t)
                t.end()
            })
    })
}

function runTestPostOk(name, api, data, testfun) {
    test(name + ' api:' + api, t => {
        request(app)
            .post(api)
            .send(data)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                t.error(err, 'no error')
                testfun(res, t)
                t.end()
            })
    })
}

function runTestPutOk(name, api, data, testfun) {
    test(name + ' api:' + api, t => {
        request(app)
            .put(api)
            .send(data)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                t.error(err, 'no error')
                testfun(res, t)
                t.end()
            })
    })
}

//let setup = require('../js/setup/nedb-setup')

let data = { title: "aaa test", duedate: "2018-11-22T13:00:00.000Z", category: 1, priority: 3, complete: null, description: "stuff" }
runTestPostOk('todo insert', '/api/v1/todo/', data, (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 22, 'id added')
})

data.description = "more stuff"
runTestPutOk('todo update', '/api/v1/todo/22', data, (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 22, 'id updated')
})

runTestDeleteOk('todo insert', '/api/v1/todo/22', (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 22, 'id deleted')
})

