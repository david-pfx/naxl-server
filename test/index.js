// unit testing

var request = require('supertest')
var test = require('tape')

var app = require('../app')

test('First test!', t => {
    t.end()
})

function runTest(name, api, testfun) {
    test(name, t => {
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
}

runTest('version', '/api/v1/version', (res, t) => {
    const pkg = require('../package.json')
    t.same(res.body, { name: pkg.name, version: pkg.version }, 'check body')
})

runTest('info', '/api/v1//', (res, t) => {
})

test('header', t => {
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

runTest('todo list', '/api/v1/todo', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 19, 'first item id')
    t.equal(row0._full_count, 21, 'full count')
    t.equal(row0.title, 'Add sample data', 'first item title')
    t.equal(row0.category, 2, 'first item category')
    t.equal(row0.category_txt, "Work", 'first item category text')
})

runTest('todo item', '/api/v1/todo/19', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 19, 'first item id')
    t.equal(row0.title, 'Add sample data', 'first item title')
    t.equal(row0.category, 2, 'first item category')
    t.equal(row0.category_txt, "Work", 'first item category text')
})

runTest('todo category lov', '/api/v1/todo/lov/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
})

runTest('contact list', '/api/v1/contact', (res, t) => {
    t.equal(res.body.length, 11, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 11, 'first item id')
})

runTest('contact item', '/api/v1/contact/11', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 11, 'first item id')
})

runTest('comics list', '/api/v1/comics', (res, t) => {
    t.equal(res.body.length, 19, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 3, 'first item id')
})

runTest('comics item', '/api/v1/comics/3', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 3, 'first item id')
})

runTest('wines list', '/api/v1/winecellar', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 5, 'first item id')
})

runTest('wines item', '/api/v1/winecellar/5', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 5, 'first item id')
})

runTest('wines collection', '/api/v1/winecellar/collec/wine_tasting?id=5', (res, t) => {
    t.equal(res.body.length, 2, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 10, 'first item id')
})

test('Last test!', t => {
    t.end()
})
