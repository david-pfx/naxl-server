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

const dbpath = './nedb-data/',
    tables_name = 'table',
    ft = dico.fieldTypes

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
    return model.fields.filter(f => f.type == ft.lov)
}

function csvHeader(fields){
    let h = {'id': 'ID'},
        lovs = {}

    fields.forEach((f) => {
        if(f.type===ft.lov){
            h[f.id] = fieldId(f)+' ID'
            h[f.id+'_txt'] = fieldId(f)
        }else{
            h[f.id] = fieldId(f)
        }
    })
    return h
}

// get model, check for error
function promiseModel(entity) {
    return new Promise(function(resolve, reject) {
        let model = dico.getModel(entity)
        if (model) resolve(model)
        else {
            let db = getDb(tables_name)
            db.find({ modelid: entity }, (err, docs) => {
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
    db.loadDatabase(err => { if (err) logger.log(err) })
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
function prepareRecord(data, model) {
    // remove formula fields -- recalculated as needed
    model.fields.forEach(f => {
        if (f.type == ft.formula)
            delete data[f.id]
    })
    return data
}

// _id is the required key, always an integer, use id if possible
// id is the required user-visible key, same as _id if missing
function prepareAdd(data, id) {
    data._id = (+data.id > 0) ? +data.id : id
    if (!data.id) data.id = data._id
    else if (+data.id > 0) data.id = +data.id
    return data
}

// prepare a key for find by id
// if id is a positive integer use _id, else use id
function prepareKey(id) {
    return (+id > 0) ? { _id: +id } : { id: id }
}

// field type json must be stringified for transmission
function unJson(data, fields) {
    fields.filter(f => f.type == ft.json).forEach(f => {
        data.forEach(r => {
            r[f.id] = JSON.stringify(r[f.id])
        })
    })
    return data
}
// augment the result set by joining on list of fields provided
// target is field.list, else table field.lovtable
// look up value in this field on lovtable._id
// replace with lovtable.name (normal tables) or lovtable.text (lov tables)
// output goes in new field.id + _txt
function joinResult(res, results, format, fields) {
    if (fields.length == 0) return sendResult(res, results, format)
    let field = fields.shift()
    let txtfld = field.id + '_txt'
    if (field.list) {
        join(results, field.list, field, txtfld)
        joinResult(res, results, format, fields)
    } else {
        if (!field.lovtable) 
            logger.log(`bad lovtable field ${field}`)
        logger.log('join', field.lovtable, field.id, txtfld)
        let db = getDb(field.lovtable)
        db.find({ }, (err, docs) => {
            ungetDb(field.lovtable)
            if (err) return sendError(res, 'db error: ' + err)
            join(results, docs, field, txtfld)
            joinResult(res, results, format, fields)
        })
    }
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
    logger.log('groups', groups)
    let result = [], i = 1
    for (let g in groups) {
        result.push({ 
            id: i++, 
            label: (labels && labels[g]) ? labels[g] : g, 
            value: groups[g] 
        })
    }
    result.sort((a, b) => { return a.label < b.label ? -1 : 1 })
    //logger.log('result', result);
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
        return res.json(results.length ? results[0] : null)
    }
    res.setHeader('_count', nbRecords)
    res.setHeader('_full_count', nbRecords && format.count ? format.count : 0)
    // TODO: find a better way to pass the total count
    if (nbRecords && format.count) results[0]["_full_count"] = format.count
    logger.logCount(results.length || 0)
    return res.json(results)
}

// create summary result
function summariseResult(docs, model) {
    let result = { count: docs.length };
    model.fields.forEach(f => {
        if (dico.fieldIsNumeric(f)) {
            if (!dico.fieldIsDateOrTime(f)) {
                let sum = docs.reduce((acc, row) => {
                    return acc + (row[f.id] || 0);
                }, 0);
                let count = docs.reduce((acc, row) => {
                    return acc + (row[f.id] ? 1 : 0);
                }, 0);
                result[f.id + '_avg'] = sum / count;
                if (f.type == ft.money || f.type == ft.int)
                    result[f.id + '_sum'] = sum;
            }
            result[f.id + '_min'] = docs.reduce((acc, row) => {
                return typeof row[f.id] == 'undefined' ? acc
                    : (acc == null || row[f.id] < acc) ? row[f.id] : acc;
            }, null);
            result[f.id + '_max'] = docs.reduce((acc, row) => {
                return typeof row[f.id] == 'undefined' ? acc
                    : (acc == null || row[f.id] > acc) ? row[f.id] : acc;
            }, null);
        }
    });
    if (config.wTimestamp) {
        result.u_date_max = docs.reduce((acc, row) => {
            return acc > row.u_date ? acc : row.u_date;
        }, docs[0].u_date);
    }
    if (config.wComments) {
        result.nb_comments = docs.reduce((acc, row) => {
            return acc + row.nb_comments;
        }, 0);
    }
    return result;
}

// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns a set of records (filtered and sorted)
function getMany(req, res) {
    logger.logReq('GET MANY', req)

    const entity = req.params.entity,
        format = req.query.format || null,
        order = req.query.order || null

    promiseModel(entity)
    .then(model => {
        let table = model.table || entity,
            orderby = orderBy(model, order)
        logger.log('get all', table, 'order by', orderby)
        
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
            joinResult(res, unJson(docs, model.fields), { 
                csv: csvheader , single: false, count: total_count 
            }, lovFields(model))
        })
    })
    .catch(err => { return sendError(res, err) })
}

// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

// - get one record by ID
function getOne(req, res) {
    logger.logReq('GET ONE', req)

    const entity = req.params.entity,
        id = req.params.id

    promiseModel(entity)
    .then(model => {
        const table = model.table || entity
        logger.log('get one', table)

        let db = getDb(table)
        db.find(prepareKey(id), (err, docs) => {
            ungetDb(table)
            if (err) return sendError(res, 'db error: ' + err)
            joinResult(res, unJson(docs, model.fields), { single: true }, lovFields(model))
        })
    })
    .catch(err => { return sendError(res, err) })
}

// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - insert a single record
function insertOne(req, res) {
    logger.logReq('INSERT ONE', req)

    const entity = req.params.entity
    promiseModel(entity)
    .then(model => {
        const table = model.table || entity

        let db = getDb(table)
        db.find({ }, (err, docs) => {
            if (err) return sendError(res, 'db error: ' + err)
            // search table for highest id (the simplest thing)
            let lastid = docs.reduce((acc, row) => { 
                return (row._id > acc) ? row._id : acc
            }, 0)
            let record = prepareAdd(prepareRecord(req.body, model), lastid + 1)
            //let record = prepareRecord(req.body, lastid + 1, model);
            db.insert(record, (err, docs) => {
                ungetDb(table)
                if (err) return sendError(res, 'db error: ' + err)
                logger.log('new:', docs)
                sendResult(res, [{ id: docs._id }], { single: true })
            })
        })
    })
    .catch(err => { return sendError(res, err) })
}

// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

// - update a single record
function updateOne(req, res) {
    logger.logReq('UPDATE ONE', req)

    const entity = req.params.entity,
        id = req.params.id

    promiseModel(entity)
    .then(model => {
        const table = model.table || entity

        let record = prepareRecord(req.body, model)
        let key = prepareKey(id)
        let db = getDb(table)
        db.update(key, record, (err, num) => {
            ungetDb(table)
            if (err) return sendError(res, 'db error: ' + err)
            sendResult(res, [{ id: key._id || key.id }], { single: true })
        })
    })
    .catch(err => { return sendError(res, err) })
}


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - delete a single record
function deleteOne(req, res) {
    logger.logReq('DELETE ONE', req)

    const entity = req.params.entity,
        id = req.params.id

    promiseModel(entity)
    .then(model => {
        const table = model.table || entity
    
        let key = prepareKey(id)
        let db = getDb(table)
        db.remove(key, {}, (err, num) => {
            ungetDb(table)
            if (err) return sendError(res, 'db error: ' + err)
            sendResult(res, [{ id: key._id || key.id }], { single: true })
        })
    })
    .catch(err => { return sendError(res, err) })
}

// --------------------------------------------------------------------------------------
// -----------------    LIST OF VALUES   ------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns list of possible values for a field (usually for dropdown)
function lovOne(req, res) {
    logger.logReq('LOV ONE', req)

    const entity = req.params.entity,
        fid = req.params.field

    promiseModel(entity)
    .then(model => {
        let field = model.fields.find(f => { return f.id === fid })
        if (!field) return sendError(res, 'Unknown field: ' + fid)
        logger.log('get all', field.lovtable)

        if (field.list) {
            sendResult(res, field.list, { })
        } else {
            let db = getDb(field.lovtable)
            db.find({ }, (err, docs) => {
                ungetDb(field.lovtable)
                if (err) sendError(res, 'db error: ' + err)
                else sendResult(res, docs, { })
            })
        }
    })
    .catch(err => { return sendError(res, err) })
}

// --------------------------------------------------------------------------------------
// -----------------    SUB-COLLECTIONS   -----------------------------------------------
// --------------------------------------------------------------------------------------

// - returns sub-collection (nested in UI but relational in DB)
function collecOne(req, res) {
    logger.logReq('GET ONE-COLLEC', req)

    const entity = req.params.entity,
        collecId = req.params.collec,
        pId = parseInt(req.query.id, 10)

    promiseModel(entity)
    .then(model => {
        const collec = getCollection(model, collecId)
        if (collec.error) return sendError(res, collec.error)

        let where = { [collec.column]: pId }, 
            orderby = { [collec.fields[0].id]: 1 }
        logger.log('get', collec.table || entity, 'where', where, 'order by', orderby)
        
        let db = getDb(collec.table)
        db.find(where).sort(orderby).exec((err, docs) => {
            ungetDb(collec.table)
            if (err) return sendError(res, 'db error: ' + err)
            sendResult(res, docs, { })
        })
    })
    .catch(err => { return sendError(res, err) })
}

// --------------------------------------------------------------------------------------
// -----------------    CHARTS   --------------------------------------------------------
// --------------------------------------------------------------------------------------

// return group and count for charting
function chartField(req, res) {
    logger.logReq('GET CHART', req);

    const entity = req.params.entity

    promiseModel(entity)
    .then(model => {
        const table = model.table || entity,
            field = getField(model, req.params.field)
        if (field.error) return sendError(res, field.error)
        logger.log('get', table, 'field:', field.id)
        
        let db = getDb(table)
        db.find({ }, (err, docs) => {
            ungetDb(table)
            logger.log(entity, err, docs.length)
            if (err) return sendError(res, 'db error: ' + err)
            if (field.type == ft.lov) {
                if (field.list) {
                    let results = groupResult(docs, field, lookupDict(field.list));
                    sendResult(res, results, { })
                } else {
                    let db2 = getDb(field.lovtable)
                    db2.find({ }, (err, lov) => {
                        ungetDb(field.lovtable)
                        if (err) return sendError(res, 'db error: ' + err)
                        let results = groupResult(docs, field, lookupDict(lov));
                        sendResult(res, results, { })
                    })
                }
            } else {
                const boolookup = { false: 'No', true: 'Yes'}
                let results = groupResult(docs, field, (field.type == ft.bool) ? boolookup : null);
                sendResult(res, results, { })
            }
        })
    })
    .catch(err => { return sendError(res, err) })
}

// - returns a summary on a single table
function statsMany(req, res) {
    logger.logReq('GET STATS', req);

    const entity = req.params.entity

    promiseModel(entity)
    .then(model => {
        const table = model.table || entity
        logger.log('get stats', table)
        
        let db = getDb(table)
        db.find({ }, (err, docs) => {
            ungetDb(table)
            let result = summariseResult(docs, model);
            //logger.log('result:', result)
            sendResult(res, [ result ], { single: true })
        })
    })
    .catch(err => { return sendError(res, err) })
}

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------

module.exports = {

    promiseModel,

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

