// simmple.js -- unit testing smoke test or debugging

var util = require('util')
var request = require('supertest')
var test = require('tape')

var runtest = require('./common')

test('First smoke test!', t => {
    t.end()
})

runtest.GetOk('todo list', '/api/v1/todo', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 20, 'first item id')
    t.equal(row0._full_count, 21, 'full count')
    t.equal(row0.title, 'Add sample data', 'first item title')
    t.equal(row0.category, 2, 'first item category')
    t.equal(row0.category_txt, "Work", 'first item category text')
})

test('Last smoke test!', t => {
    t.end()
})
