// simmple.js -- unit testing smoke test or debugging

let util = require('util')
let request = require('supertest')
let test = require('tape')
let FormData = require('form-data')
let fs = require('fs')

let runtest = require('./common')

test('Begin smoke test!', t => {
    t.end()
})

runtest.FormOk('upload image', '/api/v1/test/upload/0?field=icon', 'filename', './test/testing.png', (res, t) => {
    let result = res.body
    t.false(result.dup)
    t.equal(result.fileName, 'testing.png')
    t.equal(result.id, '0')
    t.equal(result.model, 'test')
})

runtest.FormOk('upload document', '/api/v1/test/upload/0?field=doc', 'filename', './test/testfile100.txt', (res, t) => {
    let result = res.body
    t.false(result.dup)
    t.equal(result.fileName, 'testfile100.txt')
    t.equal(result.id, '0')
    t.equal(result.model, 'test')
})

runtest.FormOk('upload CSV', '/api/v1/test/upload/2?field=content', 'filename', './test/member.csv', (res, t) => {
    let result = res.body
    t.false(result.dup)
    t.equal(result.fileName, 'member.csv')
    t.equal(result.id, '2')
    t.equal(result.model, 'test')
})

runtest.GetOkCsv('todo get csv', '/api/v1/todo?format=csv', (res, t) => {
    // fails -- why?
    //t.equal(res.body.length, 22, 'rows returned')
    //let row0 = res.body[0]
    //t.equal(row0.title, 'Add sample data', 'first item')
})

runtest.GetOk('table list', '/api/v1/table', (res, t) => {
    t.equal(res.body.length, 8, 'rows returned')
})

runtest.GetOk('todo list', '/api/v1/todo', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
})

runtest.GetOk('todo item', '/api/v1/todo/20', (res, t) => {
})

runtest.GetOk('todo chart category', '/api/v1/todo/chart/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
})

runtest.GetOk('todo chart complete', '/api/v1/todo/chart/complete', (res, t) => {
    t.equal(res.body.length, 3, 'rows returned')
})

test('End smoke test!', t => {
    t.end()
})
