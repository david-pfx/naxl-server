// suite3 -- testing database updates

var runtest = require('./common'),
    logger = require('../js/utils/logger')

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

runtest.FormOk('upload CSV', '/api/v1/test/upload/2?field=content', 'filename', './test/member.csv', (res, t) => {
    logger.log(res.body)
    let result = res.body
    t.false(result.dup, 'dup')
    t.equal(result.fileName, 'member.csv','filename')
    t.equal(result.id, '2', 'id')
    t.equal(result.model, 'test', 'model')
    t.assert(result.newdata, 'new data')
    t.equal(result.newdata.ident, 'member', 'new id')
    t.equal(result.newdata.label, 'Member', 'new label')
})

