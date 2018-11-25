// suite3 -- testing database updates

var runtest = require('./common')

//let setup = require('../js/setup/nedb-setup')

let data = { title: "aaa test", duedate: "2018-11-22T13:00:00.000Z", category: 1, priority: 3, complete: null, description: "stuff" }
runtest.PostOk('todo insert', '/api/v1/todo/', data, (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 22, 'id added')
})

data.description = "more stuff"
runtest.PutOk('todo update', '/api/v1/todo/22', data, (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 22, 'id updated')
})

runtest.DeleteOk('todo insert', '/api/v1/todo/22', (res, t) => {
    //t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body
    t.equal(row0.id, 22, 'id deleted')
})

