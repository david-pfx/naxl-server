// utility routines related to nedb

// 2019 David M. Bennett

const nedb = require('nedb')

const dico = require('./dico'),
    errors = require('./errors'),
    logger = require('./logger')

const dbpath = './nedb-data/',
    tables_name = 'table'

module.exports = {
    getDb, ungetDb, lookupDict, prepareAdd, writeTable, promiseModel, addLookups, addCollections, sendError
}

// cache for db handles
let dbCache = {}

// get db store for entity
// cache and reuse db handle
function getDb(name) {
    if (!name) throw `null database name`
    if (dbCache[name]) {
        dbCache[name].use++
        return dbCache[name].db
    }
    let db = new nedb({ filename: dbpath + name + '.db' })
    db.loadDatabase(err => { if (err) logger.log(err) })
    dbCache[name] = { db: db, use: 1 }
    return db
}

function ungetDb(name) {
    if (!name) throw `null database name`
    if (--dbCache[name].use <= 0) 
        delete dbCache[name]
}

// convert a lookup into a dictionary key=>value
function lookupDict(lookup, cb) {
    let dict = {}
    lookup.forEach(r => {
        dict[r.id] = cb ? cb(r) : r
    })
    return dict
}

// return a bad request error and clear db handle cache
function sendError(res, msg) {
    dbCache = {}
    errors.badRequest(res, msg)
}

// _id is the required key, always an integer, use id if possible
// id is the required user-visible key, same as _id if missing
function prepareAdd(data, id) {
    data._id = (+data.id > 0) ? +data.id : id
    if (!data.id) data.id = data._id
    else if (+data.id > 0) data.id = +data.id
    return data
}

// write set of rows as table
function writeTable(name, data, cbok, cberr) {
    if (!name) return cberr('null database name')
    console.log('Writing', name, 'rows', data.length);
    var db = getDb(name)
    db.remove({}, { multi: true }, (err, num) => {
        if (err) return cberr(err)
        db.persistence.compactDatafile()
        for (var i = 0; i < data.length; i++) {
            let record = prepareAdd(data[i], i + 1)
            db.insert(record, function (err, doc) { 
                if (err) return cberr(err) 
            })
        }
        db.persistence.compactDatafile()
        cbok(data.length)
    })
}

// get model, check for error, load if needed
// null entity means all models
// id is an integer on disk and has to be replaced here for the model
function promiseModel(entity) {
    return new Promise(function (resolve, reject) {
        let model = entity && dico.getModel(entity)
        if (model) return resolve(model)
        loadMasterTable(docs => {
            docs.map(d => dico.prepModel(dico.asModel(d)))
            if (!entity) return resolve(dico.models)
            let model = dico.getModel(entity)
            if (model) return resolve(model)
            else reject(`no such model: ${entity}`)
        }, reject)
    })
}

// load all models
function loadMasterTable(resolve, reject) {
    let db = getDb(tables_name)
    db.find({}, (err, docs) => {
        ungetDb(tables_name)
        if (err) return reject('db error: ' + err)
        let tableModel = docs[0]
        if (!(tableModel && tableModel.collections && tableModel.ident === 'table')) return reject('empty or incomplete master table')
        addCollections(docs, tableModel.collections, docs => resolve(docs), reject)
    })
}

// augment the result set by adding a lookup value for each field
// target is field.list, else table field.lovtable
// look up value in this field on lovtable._id
// replace with lovtable.name (normal tables) or lovtable.text (lov tables)
// output goes in new field.id + _txt
function addLookups(results, fields, resolve, reject) {
    if (fields.length == 0) return resolve(results)
    let field = fields[0]
    if (field.list) {
        addLookup(results, field.list, field.id)
        addLookups(results, fields.slice(1), resolve, reject)
    } else if (field.lovtable) {
        let lovtable = field.lovtable
        logger.log('add lookup', lovtable, field.id)
        let db = getDb(lovtable)
        db.find({ }, (err, docs) => {
            ungetDb(lovtable)
            if (err) return resolve('db error: ' + err)
            addLookup(results, docs, field.id)
            addLookups(results, fields.slice(1), resolve, reject)
        })
    } else return reject(`bad lovtable field: ${field.id}`)
}

// augment the result by adding an array field for each collection
function addCollections(results, collections, resolve, reject) {
    if (collections.length == 0) return resolve(results)
    let collection = collections[0]
    if (collection.table) {
        let table = collection.table
        logger.log('add collect', table, collection.id, collection.column)
        let db = getDb(table)
        db.find({ }, (err, docs) => {
            ungetDb(table)
            if (err) return reject('db error: ' + err)
            addCollection(results, '_id', docs, collection.column, collection.id)
            addCollections(results, collections.slice(1), resolve, reject)
        })
    } else return reject(`bad collection table: ${collection}`)
}

// add new field(s) from lookup to data 
function addLookup(data, lookup, joinfield) {
    var dict = lookupDict(lookup)
    data.forEach(row => {
        let v = dict[row[joinfield]]
        if (v) row[joinfield + '_txt'] = v.name || v.text
        if (v && v.icon) row[joinfield + '_icon'] = v.icon
    })
}

// add new field from lookup to data 
function addCollection(data, keyfield, collection, joinfield, outfield) {
    let dict = {}
    collection.forEach(row => {
        let key = row[joinfield]
        if (dict[key])
            dict[key].push(row)
        else dict[key] = [ row ]
    })
    data.forEach(row => {
        row[outfield] = dict[row[keyfield]] || []
    })
}

