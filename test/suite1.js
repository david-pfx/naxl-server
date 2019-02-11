// suite1.js -- raw tests and stuff that fails

var request = require('supertest'),
    test = require('tape')

var app = require('../app')

test('header 200', t => {
    request(app)
        .get('/api/v1/todo')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('_full_count', "21")
        .end((err, res) => {
            t.error(err, 'no error')
            t.end()
        })
})

test('header 400', t => {
    request(app)
        .get('/api/v1/xxx')
        .expect(400)
        .end((err, res) => {
            t.error(err, 'no error')
            t.end()
        })
})

test('header 400', t => {
    request(app)
        .get('/api/v1/winecellar/collec/xxx')
        .expect(400)
        .end((err, res) => {
            t.error(err, 'no error')
            t.end()
        })
})
        
        