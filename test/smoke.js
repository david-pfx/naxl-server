// simmple.js -- unit testing smoke test or debugging

let util = require('util'),
    request = require('supertest'),
    test = require('tape'),
    FormData = require('form-data'),
    fs = require('fs')

    
let runtest = require('./common'),
    logger = require('../js/utils/logger')

smokeTests(false)
specialTests(true)

test('End smoke test!', t => {
    t.end()
})

function smokeTests(enableLogging) {
    test('Begin smoke tests!', t => {
        logger.setEnable(enableLogging)
        t.end()
    })

    runtest.GetOk('table list', '/api/v1/table', (res, t) => {
        t.equal(res.body.length, 9, 'rows returned')
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
        t.equal(res.body.length, 5, 'rows returned')
    })

    runtest.GetOk('wine cellar 2', '/api/v1/winecellar/2', (res, t) => {
        //logger.log(res.body)
        let result = res.body
        //t.equal(res.body.length, 21, 'rows returned')
    })

    runtest.GetOk('wine cellar collec', '/api/v1/winecellar/collec/wine_tasting?id=2&pageSize=50', (res, t) => {
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

    runtest.GetOk('wines join all', '/api/v1/winecellar?join=all', (res, t) => {
        t.equal(res.body.length, 5, 'rows returned')
        let row0 = res.body[0]
        //logger.log(row0)
        t.equal(row0.id, 5, 'first item id')
        t.equal(row0.wine_tasting.length, 2, 'collec length')
        t.equal(row0.wine_tasting[0].id, 10, 'first child')
        t.equal(row0.wine_tasting[0].wine_id, 5, 'first child parent')
    })

    runtest.GetOk('table list join all', '/api/v1/table?join=all', (res, t) => {
        t.equal(res.body.length, 9, 'rows returned')
        let row0 = res.body[0]
        //logger.log(row0)
        t.equal(row0.id, 5, 'first item id')
        t.equal(row0.ident, 'comics', 'first item entity')
        t.equal(row0.groups.length, 2, 'first item groups')
        t.equal(row0.fields.length, 11, 'first item fields')
    })

    runtest.GetOk('table 5 join all', '/api/v1/table/5?join=all', (res, t) => {
        let row0 = res.body
        //logger.log(row0)
        t.equal(row0.id, 5, 'item id')
        t.equal(row0.ident, 'comics', 'item entity')
        t.equal(row0.groups.length, 2, 'item groups')
        t.equal(row0.fields.length, 11, 'item fields')
    })

    runtest.GetOk('table field collec', '/api/v1/table/collec/fields?id=4&pageSize=50', (res, t) => {
        t.equal(res.body.length, 17, 'rows returned')
        let row0 = res.body[0]
        //logger.log(row0)
    })

}

function specialTests(enableLogging) {
    test('Begin special tests!', t => {
        logger.setEnable(enableLogging)
        t.end()
    })

    runtest.GetOk('models', '/api/v1/models', (res, t) => {
        t.equal(res.body.length, 1, 'rows returned')
        let row0 = res.body[0]
        //logger.log(row0)
    })

    // let data = { entity: "member", kind: 1, source: 'table/member.csv' }
    // runtest.PostOk('todo insert', '/api/v1/table/', data, (res, t) => {
    //     //t.equal(res.body.length, 1, 'rows returned')
    //     let result = res.body
    //     logger.log(result)
    // })
}
