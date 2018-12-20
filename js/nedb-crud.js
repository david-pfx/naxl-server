/*! *******************************************************
 *
 * evolutility-server-node :: crud.js
 * CRUD (Create, Read, Update, Delete) end-points
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const nedb = require('nedb'),
    csv = require('csv-express')        // later fork on express-csv

const dico = require('./utils/dico'),
    errors = require('./utils/errors'),
    logger = require('./utils/logger'),
    config = require('../config')

const dbpath = './nedb-data/'

const defaultPageSize = config.pageSize || 50,
    lovSize = config.lovSize || 100

// - build the header row for CSV export
const csvHeaderColumn = config.csvHeader || 'label'

function fieldId(f){
    return (csvHeaderColumn === 'label') ? f.label || f.id : f.id
}

// convert a lookup into a dictionary
function lookupDict(lookup) {
    let dict = {}
    lookup.forEach(r => {
        dict[r.id] = r.name || r.text
    })
    return dict
}

function lovFields(model) {
    return model.fields.filter(f => f.type == 'lov')
}

function csvHeader(fields){
    let h = {'id': 'ID'},
        lovs = {}

    fields.forEach((f) => {
        if(f.type==='lov'){
            h[f.id] = fieldId(f)+' ID'
            h[f.id+'_txt'] = fieldId(f)
        }else{
            h[f.id] = fieldId(f)
        }
    })
    return h
}

// get model, check for error
function getModel(entity) {
    model = dico.getModel(entity)
    if (!model) return { error: 'Invalid entity: "' + entity + '".' }
    return model
}

function getCollection(model, name) {
    if (!model.collecsH[name]) return { error: 'Invalid collection: "' + name + '".' }
    return model.collecsH[name]
}

// get field, check for error
function getField(model, name) {
    let field = model.fields.find(f => f.id == name)
    if (!field) return { error: 'Invalid field: "' + name + '".' }
    return field
}

// cache for db handles
let dbCache = {}

// return a bad request error and clear db handle cache
function sendError(res, msg) {
    dbCache = {}
    errors.badRequest(res, msg)
}

// get db store for entity
// cache and reuse db handle
function getDb(name) {
    if (dbCache[name]) {
        dbCache[name].use++
        return dbCache[name].db
    }
    let db = new nedb({ filename: dbpath + name + '.db' })
    db.loadDatabase(err => { if (err) console.log(err) })
    dbCache[name] = { db: db, use: 1 }
    return db
}

function ungetDb(name) {
    if (--dbCache[name].use <= 0) 
        delete dbCache[name]
}

// parse somefield.asc, into { somefield: 1, }
// BUG: fields in object are not ordered
function orderBy(model, order) {
    orderby = { }
    if (!order) orderby[model.fields[0].id] = 1
    else {
        order.split(',').forEach(s => {
            let ss = s.split('.')
            if (ss.length == 2) 
                orderby[ss[0]] = (ss[1] == 'desc') ? -1 : 1
            else orderby[ss] = 1
        })
    }
    return orderby
}

// prepare a record for insert or update
function prepareRecord(data, id, model) {
    data.id = data._id = id
    model.fields.forEach(f => {
        if (f.type == 'formula')
            delete data[f.id]
    })
    return data
}

// augment the result set by the addition of joined fields on lov tables
// look up value in this field on lovtable._id
// replace with lovtable.name (normal tables) or lovtable.text (lov tables)
// output goes in new field.id + _txt
function joinResult(res, results, format, fields) {
    if (fields.length == 0) return sendResult(res, results, format)
    let field = fields.shift()
    let txtfld = field.id + '_txt'
    if (!field.lovtable) 
        console.log(`bad lovtable field ${field}`)
    console.log('join', field.lovtable, field.id, txtfld)
    let db = getDb(field.lovtable)
    db.find({ }, (err, docs) => {
        ungetDb(field.lovtable)
        if (err) return sendError(res, 'db error: ' + err)
        join(results, docs, field, txtfld)
        joinResult(res, results, format, fields)
    })
}

// add new field from lookup to data 
function join(data, lookup, field, txtfld) {
    var dict = lookupDict(lookup)
    data.forEach(row => {
        row[txtfld] = dict[row[field.id]] || row[field.id]
    })
}

// create grouping of data on given field using labels if supplied
function groupResult(data, field, labels) {
    let groups = {}
    data.forEach(row => {
        let value = row[field.id]
        if (typeof value == 'undefined') value = 'Unknown'
         groups[value] = (groups[value]) ? groups[value] + 1 : 1
    })
    console.log('groups', groups)
    let result = [], i = 1
    for (let g in groups) {
        result.push({ 
            id: i++, 
            label: (labels && labels[g]) ? labels[g] : g, 
            value: groups[g] 
        })
    }
    result.sort((a, b) => { return a.label < b.label ? -1 : 1 })
    //console.log('result', result);
    return result
}

// format and send result as CSV, single or set
function sendResult(res, results, format) {
    var nbRecords = results.length
    if (format.csv) {
        if (!nbRecords) return null
        results.unshift(format.csv)
        logger.logCount(results.length || 0)
        return res.csv(results)
    }
    if (format.single) {
        logger.logCount(results.length || 0)
        return res.json(results.length?results[0]:null)
    }
    res.setHeader('_count', nbRecords)
    res.setHeader('_full_count', nbRecords && format.count ? format.count : 0)
    // TODO: find a better way to pass the total count
    if (nbRecords && format.count) results[0]["_full_count"] = format.count
    logger.logCount(results.length || 0)
    return res.json(results)
}

// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns a set of records (filtered and sorted)
function getMany(req, res) {
    logger.logReq('GET MANY', req)

    const entity = req.params.entity,
        format = req.query.format || null,
        order = req.query.order || null,
        model = getModel(entity)
    if (model.error) return sendError(res, model.error)

    let table = model.table || entity,
        orderby = orderBy(model, order)
    console.log('get all', table, 'order by', orderby)
    
    let csvheader = (format==='csv') ? csvHeader(model.fields) : null,
        db = getDb(table),
        total_count = 0
    db.count({}, function(err, n) {
        ungetDb(table)
        if (err) return sendError(res, 'db error: ' + err)
        total_count = n
    })
    // TODO: make sort case-insensitive
    db.find({}).sort(orderby).exec((err, docs) => {
        if (err) return sendError(res, 'db error: ' + err)
        joinResult(res, docs, { csv: csvheader , single: false, count: total_count }, lovFields(model))
    })
}

// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

// - get one record by ID
function getOne(req, res) {
    logger.logReq('GET ONE', req)

    const entity = req.params.entity,
        id = +req.params.id,
        model = getModel(entity),
        table = model.table || entity
    if (model.error) return sendError(res, model.error)

    console.log('get one', table)
    let db = getDb(table)
    db.find({ _id: id }, (err, docs) => {
        ungetDb(table)
        if (err) return sendError(res, 'db error: ' + err)
        joinResult(res, docs, { single: true }, lovFields(model))
    })
}

// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - insert a single record
function insertOne(req, res) {
    logger.logReq('INSERT ONE', req)

    const entity = req.params.entity,
        model = getModel(entity),
        table = model.table || entity
    if (model.error) return sendError(res, model.error)

    let db = getDb(table)
    db.find({ }, (err, docs) => {
        if (err) return sendError(res, 'db error: ' + err)
        // search table for highest id (the simplest thing)
        let id = docs.reduce((acc, row) => { 
            return (row._id > acc) ? row._id : acc
        }, 0)
        let record = prepareRecord(req.body, id + 1, model);
        db.insert(record, (err, docs) => {
            ungetDb(table)
            if (err) return sendError(res, 'db error: ' + err)
            console.log('new:', docs)
            sendResult(res, [{ id: docs._id }], { single: true })
        })
    })
}

// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

// - update a single record
function updateOne(req, res) {
    logger.logReq('UPDATE ONE', req)

    const entity = req.params.entity,
        id = +req.params.id,
        model = getModel(entity),
        table = model.table || entity
    if (model.error) return sendError(res, model.error)

    let record = prepareRecord(req.body, id, model);
    let db = getDb(table)
    db.update({ _id: id }, record, (err, num) => {
        ungetDb(table)
        if (err) return sendError(res, 'db error: ' + err)
        sendResult(res, [{ id: id }], { single: true })
    })
}


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - delete a single record
function deleteOne(req, res) {
    logger.logReq('DELETE ONE', req)

    const entity = req.params.entity,
        id = +req.params.id,
        model = getModel(entity),
        table = model.table || entity
    if (model.error) return sendError(res, model.error)
    
    let db = getDb(table)
    db.remove({ _id: id }, {}, (err, num) => {
        ungetDb(table)
        if (err) return sendError(res, 'db error: ' + err)
        sendResult(res, [{ id: id }], { single: true })
    })
}


// --------------------------------------------------------------------------------------
// -----------------    LIST OF VALUES   ------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns list of possible values for a field (usually for dropdown)
function lovOne(req, res) {
    logger.logReq('LOV ONE', req)

    const entity = req.params.entity,
        fid = req.params.field,
        model = getModel(entity)
    if (model.error) return sendError(res, model.error)

    let field = model.fields.find(f => { return f.id === fid })
    if (!field) return sendError(res, 'Unknown field: ' + fid)
    console.log('get all', field.lovtable)

    let db = getDb(field.lovtable)
    db.find({ }, (err, docs) => {
        ungetDb(field.lovtable)
        if (err) sendError(res, 'db error: ' + err)
        else sendResult(res, docs, { })
    })
}


// --------------------------------------------------------------------------------------
// -----------------    SUB-COLLECTIONS   -----------------------------------------------
// --------------------------------------------------------------------------------------

// - returns sub-collection (nested in UI but relational in DB)
function collecOne(req, res) {
    logger.logReq('GET ONE-COLLEC', req)

    const entity = req.params.entity,
        collecId = req.params.collec,
        pId = parseInt(req.query.id, 10),
        model = getModel(entity)
    if (model.error) return sendError(res, model.error)
    const collec = getCollection(model, collecId)
    if (collec.error) return sendError(res, collec.error)

    let where = { [collec.column]: pId }, 
        orderby = { [collec.fields[0].id]: 1 }
    console.log('get', collec.table || entity, 'where', where, 'order by', orderby)
    
    let db = getDb(collec.table)
    db.find(where).sort(orderby).exec((err, docs) => {
        ungetDb(collec.table)
        if (err) return sendError(res, 'db error: ' + err)
        sendResult(res, docs, { })
    })
}

// --------------------------------------------------------------------------------------
// -----------------    CHARTS   --------------------------------------------------------
// --------------------------------------------------------------------------------------

// return group and count for charting
function chartField(req, res) {
    logger.logReq('GET CHART', req);

    const entity = req.params.entity,
        model = getModel(entity),
        field = getField(model, req.params.field),
        table = model.table || entity
    if (model.error) return sendError(res, model.error)
    if (field.error) return sendError(res, field.error)

    console.log('get', table, 'field:', field.id)
    
    let db = getDb(table)
    db.find({ }, (err, docs) => {
        ungetDb(table)
        console.log(entity, err, docs.length)
        if (err) return sendError(res, 'db error: ' + err)
        if (field.type == 'lov') {
            let db2 = getDb(field.lovtable)
            db2.find({ }, (err, lov) => {
                ungetDb(field.lovtable)
                if (err) return sendError(res, 'db error: ' + err)
                let results = groupResult(docs, field, lookupDict(lov));
                sendResult(res, results, { })
            })
        } else {
            const boolookup = { false: 'No', true: 'Yes'}
            let results = groupResult(docs, field, (field.type == 'boolean') ? boolookup : null);
            sendResult(res, results, { })
        }
    })
}

// - returns a summary on a single table
function statsMany(req, res) {
    logger.logReq('GET STATS', req);

    const entity = req.params.entity,
        model = getModel(entity),
        table = model.table || entity
    if (model.error) return sendError(res, model.error)

    console.log('get stats', table)
    
    let db = getDb(table)
    db.find({ }, (err, docs) => {
        ungetDb(table)
        let result = { count: docs.length }
        model.fields.forEach(f => {
            if (dico.fieldIsNumeric(f)) {
                if (!dico.fieldIsDateOrTime(f)) {
                    let sum = docs.reduce((acc, row) => { 
                        return acc + (row[f.id] || 0)
                    }, 0)
                    let count = docs.reduce((acc, row) => { 
                        return acc + (row[f.id] ? 1 : 0)
                    }, 0)
                    result[f.id + '_avg'] = sum / count
                    if (f.type == 'money' || f.type == 'integer')
                        result[f.id + '_sum'] = sum
                }
                result[f.id + '_min'] = docs.reduce((acc, row) => { 
                    return typeof row[f.id] == 'undefined' ? acc
                        : (acc == null || row[f.id] < acc) ? row[f.id] : acc
                }, null)
                result[f.id + '_max'] = docs.reduce((acc, row) => { 
                    return typeof row[f.id] == 'undefined' ? acc
                        : (acc == null || row[f.id] > acc) ? row[f.id] : acc
                }, null)
            }
        })
        if(config.wTimestamp){
            result.u_date_max = docs.reduce((acc, row) => { 
                return acc > row.u_date ? acc : row.u_date
            }, docs[0].u_date)
        }
        if(config.wComments){
            result.nb_comments = docs.reduce((acc, row) => { 
                return acc + row.nb_comments
            }, 0)
        }
        //console.log('result:', result)
        sendResult(res, [ result ], { })
    })
}

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------

module.exports = {

    // - CRUD
    getMany: getMany,
    getOne: getOne,
    insertOne: insertOne,
    updateOne: updateOne,
    deleteOne: deleteOne,

    // - Sub-collections
    getCollec: collecOne,

    // - LOVs (for dropdowns)
    lovOne: lovOne,

    chartField: chartField,
    statsMany: statsMany

}
