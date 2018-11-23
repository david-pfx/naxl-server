// suite2 -- unit testing

var request = require('supertest')
var test = require('tape')

var app = require('../app')

// all tests use this common structure
function runTestResponse(name, api, testfun) {
    test(name + ' api:' + api, t => {
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

// tests start here
runTestResponse('version', '/api/v1/version', (res, t) => {
    const pkg = require('../package.json')
    t.same(res.body, { name: pkg.name, version: pkg.version }, 'check body')
})

runTestResponse('info', '/api/v1//', (res, t) => {
})

runTestResponse('todo list', '/api/v1/todo', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 19, 'first item id')
    t.equal(row0._full_count, 21, 'full count')
    t.equal(row0.title, 'Add sample data', 'first item title')
    t.equal(row0.category, 2, 'first item category')
    t.equal(row0.category_txt, "Work", 'first item category text')
})

runTestResponse('todo item', '/api/v1/todo/19', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 19, 'first item id')
    t.equal(row0.title, 'Add sample data', 'first item first column')
    t.equal(row0.category, 2, 'first item category')
    t.equal(row0.category_txt, "Work", 'first item category text')
})

runTestResponse('contact list', '/api/v1/contact', (res, t) => {
    t.equal(res.body.length, 11, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.lastname, 'Cheng', 'first item first column')
})

runTestResponse('contact item', '/api/v1/contact/11', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 11, 'first item id')
})

runTestResponse('comics list', '/api/v1/comics', (res, t) => {
    t.equal(res.body.length, 19, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Alim le Tanneur', 'first item first column')
})

runTestResponse('comics item', '/api/v1/comics/3', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 3, 'first item id')
})

runTestResponse('wines list', '/api/v1/winecellar', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
    // case sensitive
    t.equal(row0.name, 'Château Montelena', 'first item first column')
    // case insensitive
    //t.equal(row0.lastname, 'Château d\'Yquem', 'first item first column')    
})

runTestResponse('wines item', '/api/v1/winecellar/5', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 5, 'first item id')
})

// LOV
runTestResponse('todo category lov', '/api/v1/todo/lov/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
})

// COLLECTIONS
runTestResponse('wines collection', '/api/v1/winecellar/collec/wine_tasting?id=5', (res, t) => {
    t.equal(res.body.length, 2, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 10, 'first item id')
})

// ORDER BY
runTestResponse('todo order', '/api/v1/todo?order=', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Add sample data', 'first item')
})

runTestResponse('todo order title', '/api/v1/todo?order=title', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Add sample data', 'first item')
})

runTestResponse('todo order title asc', '/api/v1/todo?order=title.asc', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Add sample data', 'first item')
})

runTestResponse('todo order title desc', '/api/v1/todo?order=title.desc', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Watch Inception', 'first item')
})

runTestResponse('todo chart', '/api/v1/todo/chart/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
})

runTestResponse('todo chart category', '/api/v1/todo/chart/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
})

runTestResponse('todo chart priority', '/api/v1/todo/chart/priority', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
})

runTestResponse('todo chart complete', '/api/v1/todo/chart/complete', (res, t) => {
    //t.equal(res.body.length, 2, 'rows returned')
    t.equal(res.body.length, 3, 'rows returned')  // including Unknown
    let row0 = res.body[0]
})

runTestResponse('wine stats', '/api/v1/winecellar/stats', (res, t) => {
    t.equal(res.body.length, 1, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.price_min, 20, 'price min')
    t.equal(row0.price_max, 399, 'price max')
    t.equal(row0.price_sum, 543, 'price sum')
    t.equal(row0.price_avg, 108.6, 'price avg')
})
