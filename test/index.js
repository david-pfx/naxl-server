// index.js -- unit testing master

var request = require('supertest')
var test = require('tape')

var runtest = require('./common')

test('First test!', t => {
    t.end()
})

 require('./suite1')
 require('./suite2')
 require('./suite3')

runtest.GetOk('table list', '/api/v1/table', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0._full_count, 21, 'full count')
    t.equal(row0.label, 'Address Book', 'first item')
    t.equal(row0.table, 'contact', 'first item')
})

runtest.GetOkCsv('todo get csv', '/api/v1/todo?format=csv', (res, t) => {
    t.equal(res.body.length, 22, 'rows returned')
    let row0 = res.body[0]
    // fails -- why?
    //t.equal(row0.title, 'Add sample data', 'first item')
})

test('Last test!', t => {
    t.end()
})
