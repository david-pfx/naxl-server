// suite3 -- testing database updates

var runtest = require('./common')

//let setup = require('../js/setup/nedb-setup')

let data = { title: "aaa test", duedate: "2018-11-22T13:00:00.000Z", category: 1, priority: 3, complete: null, description: "stuff" }
runtest.PostOk('todo insert', '/api/v1/todo/', data, (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 23, 'id added')
})

data.description = "more stuff"
runtest.PutOk('todo update', '/api/v1/todo/23', data, (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 23, 'id updated')
})

runtest.DeleteOk('todo delete', '/api/v1/todo/23', (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 23, 'id deleted')
})

runtest.FormOk('upload image', '/api/v1/test/upload/0?field=image', 'filename', './test/testing.png', (res, t) => {
    let result = res.body
    t.false(result.dup)
    t.equal(result.fileName, 'testing.png')
    t.equal(result.id, '0')
    t.equal(result.model, 'test')
})

runtest.FormOk('upload document', '/api/v1/test/upload/0?field=document', 'filename', './test/testfile100.txt', (res, t) => {
    let result = res.body
    t.false(result.dup)
    t.equal(result.fileName, 'testfile100.txt')
    t.equal(result.id, '0')
    t.equal(result.model, 'test')
})

