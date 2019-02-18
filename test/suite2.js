// suite2 -- testing database queries

var runtest = require('./common')


runtest.GetOk('version', '/api/v1/version', (res, t) => {
    const pkg = require('../package.json')
    t.same(res.body, { name: pkg.name, version: pkg.version }, 'check body')
})

runtest.GetOk('info', '/api/v1//', (res, t) => {
})

runtest.GetOk('table list', '/api/v1/table', (res, t) => {
    t.equal(res.body.length, 9, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0._full_count, 9, 'full count')
    //t.equal(row0.label, 'Address Book', 'first item')  // TODO
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

runtest.GetOk('todo item', '/api/v1/todo/20', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 20, 'first item id')
    t.equal(row0.title, 'Add sample data', 'first item first column')
    t.equal(row0.category, 2, 'first item category')
    t.equal(row0.category_txt, "Work", 'first item category text')
})

runtest.GetOk('contact list', '/api/v1/contact', (res, t) => {
    t.equal(res.body.length, 50, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 72, 'first item id')
    t.equal(row0.lastname, 'Abdallah', 'first item first column')
})

runtest.GetOk('contact item', '/api/v1/contact/11', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 11, 'first item id')
})

runtest.GetOk('comics list', '/api/v1/comics', (res, t) => {
    t.equal(res.body.length, 19, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Alim le Tanneur', 'first item first column')
})

runtest.GetOk('comics item', '/api/v1/comics/3', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 3, 'first item id')
})

runtest.GetOk('wines list', '/api/v1/winecellar', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 5, 'first item id')
    // case sensitive
    t.equal(row0.name, 'Château Montelena', 'first item first column')
    // case insensitive
    //t.equal(row0.lastname, 'Château d\'Yquem', 'first item first column')    
})

runtest.GetOk('wines item', '/api/v1/winecellar/5', (res, t) => {
    let row0 = res.body
    t.equal(row0.id, 5, 'first item id')
    t.equal(row0.name, 'Château Montelena', 'first item name')
    t.equal(row0.vintage, 2009, 'first item vintage')
})

runtest.GetOk('wine tasting list', '/api/v1/winetasting', (res, t) => {
    t.equal(res.body.length, 13, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 11, 'first item id')
    t.equal(row0.drink_date, '2017-05-05', 'drink date')
    t.equal(row0.wine_id, 5, 'wine id')
    t.equal(row0.wine_id_txt, 'Château Montelena', 'wine name')
})

// LOV
runtest.GetOk('todo category lov', '/api/v1/todo/lov/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
})

// COLLECTIONS
runtest.GetOk('wines collection', '/api/v1/winecellar/collec/wine_tasting?id=5', (res, t) => {
    t.equal(res.body.length, 3, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.id, 11, 'first item id')
})

// ORDER BY
runtest.GetOk('todo order', '/api/v1/todo?order=', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Add sample data', 'first item')
})

runtest.GetOk('todo order title', '/api/v1/todo?order=title', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Add sample data', 'first item')
})

runtest.GetOk('todo order title asc', '/api/v1/todo?order=title.asc', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Add sample data', 'first item')
})

runtest.GetOk('todo order title desc', '/api/v1/todo?order=title.desc', (res, t) => {
    t.equal(res.body.length, 21, 'rows returned')
    let row0 = res.body[0]
    t.equal(row0.title, 'Watch Inception', 'first item')
})

// CHART
runtest.GetOk('todo chart', '/api/v1/todo/chart/category', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
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

runtest.GetOk('todo chart priority', '/api/v1/todo/chart/priority', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
})

runtest.GetOk('todo chart complete', '/api/v1/todo/chart/complete', (res, t) => {
    //t.equal(res.body.length, 2, 'rows returned')
    t.equal(res.body.length, 3, 'rows returned')  // including Unknown
    let row0 = res.body[0]
})

// STATS
runtest.GetOk('wine stats', '/api/v1/winecellar/stats', (res, t) => {
    let row0 = res.body
    t.equal(row0.price_min, 20, 'price min')
    t.equal(row0.price_max, 399, 'price max')
    t.equal(row0.price_sum, 543, 'price sum')
    t.equal(row0.price_avg, 108.6, 'price avg')
})

// JOIN ALL
runtest.GetOk('wines join all', '/api/v1/winecellar?join=all', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
    let row0 = res.body[0]
    //logger.log(row0)
    t.equal(row0.id, 5, 'first item id')
    t.equal(row0.wine_tasting.length, 3, 'collec length')
    t.equal(row0.wine_tasting[0].id, 11, 'first child')
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

// PAGING
runtest.GetOk('todo list', '/api/v1/todo?pageSize=10', (res, t) => {
    t.equal(res.body.length, 10, 'rows returned')
})

runtest.GetOk('todo list', '/api/v1/todo?page=2&pageSize=8', (res, t) => {
    t.equal(res.body.length, 5, 'rows returned')
})


