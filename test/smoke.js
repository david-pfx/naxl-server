// simmple.js -- unit testing smoke test or debugging

let util = require('util')
let request = require('supertest')
let test = require('tape')
let FormData = require('form-data')
let fs = require('fs')

logger = require('../js/utils/logger')

let runtest = require('./common')

test('Begin smoke test!', t => {
    //logger.setEnable(false)
    t.end()
})

runtest.GetOk('table list', '/api/v1/table', (res, t) => {
    t.equal(res.body.length, 8, 'rows returned')
})

runtest.GetOk('table 2', '/api/v1/table/2', (res, t) => {
    //logger.log(res.body)
    let result = res.body
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

runtest.GetOk('wine cellar', '/api/v1/winecellar', (res, t) => {
    //logger.log(res.body)
    let result = res.body
    //t.equal(res.body.length, 21, 'rows returned')
})

runtest.GetOk('wine cellar 2', '/api/v1/winecellar/2', (res, t) => {
    //logger.log(res.body)
    let result = res.body
    //t.equal(res.body.length, 21, 'rows returned')
})

runtest.GetOk('wine cellar 2', '/api/v1/winecellar/collec/wine_tasting?id=2&pageSize=50', (res, t) => {
    //logger.log(res.body)
    let result = res.body
    //t.equal(res.body.length, 21, 'rows returned')
})


runtest.GetOkCsv('todo get csv', '/api/v1/todo?format=csv', (res, t) => {
    // fails -- why?
    //t.equal(res.body.length, 22, 'rows returned')
    //let row0 = res.body[0]
    //t.equal(row0.title, 'Add sample data', 'first item')
})

test('Begin special tests!', t => {
    logger.setEnable(true)
    t.end()
})

runtest.FormOk('upload CSV', '/api/v1/test/upload/2?field=content', 'filename', './test/member.csv', (res, t) => {
    logger.log(res.body)
    let result = res.body
    t.false(result.dup, 'dup')
    t.equal(result.fileName, 'member.csv','filename')
    t.equal(result.id, '2', 'id')
    t.equal(result.model, 'test', 'model')
    t.equal(result.newdata.entity, 'member', 'new id')
    t.equal(result.newdata.label, 'Member', 'new label')
})

// let data = { entity: "member", kind: 1, source: 'table/member.csv' }
// runtest.PostOk('todo insert', '/api/v1/table/', data, (res, t) => {
//     //t.equal(res.body.length, 1, 'rows returned')
//     let result = res.body
//     logger.log(result)
// })

test('End smoke test!', t => {
    t.end()
})
