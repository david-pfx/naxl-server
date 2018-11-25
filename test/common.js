// suite2 -- unit testing

var request = require('supertest')
var test = require('tape')

var app = require('../app')

// all tests use this common structure
function GetOk(name, api, testfun) {
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

function DeleteOk(name, api, testfun) {
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

function PostOk(name, api, data, testfun) {
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

function PutOk(name, api, data, testfun) {
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

module.exports = {
    GetOk: GetOk,
    DeleteOk: DeleteOk,
    PostOk: PostOk,
    PutOk: PutOk
}