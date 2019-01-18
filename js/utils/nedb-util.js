// utility routines related to nedb

// 2019 David M. Bennett

const nedb = require('nedb')

const dico = require('./dico'),
    errors = require('./errors'),
    logger = require('./logger')

const dbpath = './nedb-data/',
    tables_name = 'table'

module.exports = {
    getDb, ungetDb, prepareAdd, writeTable, promiseModel
}

// cache for db handles
let dbCache = {}

// get db store for entity
// cache and reuse db handle
function getDb(name) {
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
    if (--dbCache[name].use <= 0) 
        delete dbCache[name]
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

// get model, check for error
function promiseModel(entity) {
    return new Promise(function(resolve, reject) {
        let model = dico.getModel(entity)
        if (model) resolve(model)
        else {
            let db = getDb(tables_name)
            db.find({ entity: entity }, (err, docs) => {
                ungetDb(tables_name)
                if (err) reject('db error: ' + err)
                else if (!docs.length) reject('Invalid entity: "' + entity + '".')
                else {
                    let model = dico.prepModel(docs[0])
                    resolve(model)
                }
            })
        }
    })
}

