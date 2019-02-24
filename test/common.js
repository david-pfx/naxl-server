// suite2 -- unit testing

var request = require('supertest')
var test = require('tape')

var app = require('../app')

// all tests use this common structure

module.exports = {

    comment: function(msg) {
        test(msg, t => {
            t.end()
        })
    },

    direct: function(name, testfun) {
        test(`-------- ${name} --------`, t => {
            testfun(t)
            t.end()
        })
    },

    GetOk: function(name, api, testfun) {
        test(`======== ${name} === ${api} ========`, t => {
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
    },

    DeleteOk: function(name, api, testfun) {
        test(`======== ${name} === ${api} ========`, t => {
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
    },

    PostOk: function(name, api, data, testfun) {
        test(`======== ${name} === ${api} ========`, t => {
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
    },

    PutOk: function(name, api, data, testfun) {
        test(`======== ${name} === ${api} ========`, t => {
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
    },

    GetOkCsv: function(name, api, testfun) {
        test(`======== ${name} === ${api} ========`, t => {
            request(app)
                .get(api)
                .expect(200)
                .expect('Content-Type', /csv/)
                .end((err, res) => {
                    t.error(err, 'no error')
                    testfun(res, t)
                    t.end()
                })
        })
    },

    FormOk: function(name, api, filename, filepath, testfun) {
        test(`======== ${name} === ${api} ========`, t => {
            request(app)
                .post(api)
                .attach(filename, filepath)
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    t.error(err, 'no error')
                    testfun(res, t)
                    t.end()
                })
        })
    },

}