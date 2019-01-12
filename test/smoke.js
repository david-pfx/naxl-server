// simmple.js -- unit testing smoke test or debugging

let util = require('util')
let request = require('supertest')
let test = require('tape')
let FormData = require('form-data')
let fs = require('fs')

let runtest = require('./common')

test('First smoke test!', t => {
    t.end()
})

// let form = new FormData()
// form.append('filename', fs.readFileSync('./test/testfile100.txt'))
// //form.append('filename', fs.createReadStream('./testfile100.txt'))
// console.log('form', form)
// runtest.PostOk('upload file', '/api/v1/upload/comics/0?field=icon', form, (res, t) => {
//     t.equal(typeof res.body, 'string', 'single string')
//     let row0 = res.body
// })

runtest.GetOk('table list', '/api/v1/table', (res, t) => {
    t.equal(res.body.length, 8, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0._full_count, 8, 'full count')
    t.equal(row0.label, 'Address Book', 'first item')
    t.equal(row0.table, 'contact', 'first item')
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

runtest.GetOk('todo chart category', '/api/v1/todo/chart/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 3, 'first item id')
    t.equal(row0.label, 'Fun', 'first item label')
    t.equal(row0.value, 2, 'first item value')
})

runtest.GetOk('todo chart complete', '/api/v1/todo/chart/complete', (res, t) => {
    t.equal(res.body.length, 3, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 1, 'first item id')
    t.equal(row0.label, 'No', 'first item label')
    t.equal(row0.value, 9, 'first item value')
})

test('Last smoke test!', t => {
    t.end()
})
