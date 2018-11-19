/*! *******************************************************
 *
 * evolutility-server-node :: crud.js
 * CRUD (Create, Read, Update, Delete) end-points
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const nedb = require('nedb')

const dico = require('./utils/dico'),
    errors = require('./utils/errors.js'),
    logger = require('./utils/logger'),
    config = require('../config.js')

const dbpath = './nedb-data/'

const defaultPageSize = config.pageSize || 50,
    lovSize = config.lovSize || 100

// - build the header row for CSV export
const csvHeaderColumn = config.csvHeader || 'label'

function fieldId(f){
    return (csvHeaderColumn === 'label') ? f.label || f.id : f.id
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
function getModel(res, entity) {
    model = dico.getModel(entity)
    if (!model) errors.badRequest(res, 'Invalid entity: "' + entity + '".')
    return model
}

function getCollection(res, model, name) {
    if (!model.collecsH[name]) errors.badRequest(res, 'Invalid collection: "' + name + '".')
    return model.collecsH[name]
}

// get db store for entity
function getDb(name) {
    return new nedb({ filename: dbpath + name + '.db', autoload: true })
}

function lovFields(model) {
    return model.fields.filter(f => f.type == 'lov')
}

// augment the result set by the addition of joined fields on lov tables
// look up value in this field on lovtable._id
// replace with lovtable.name (normal tables) or lovtable.text (lov tables)
// output goes in new field.id + _txt
function joinResult(res, results, format, fields) {
    if (fields.length == 0) return sendResult(res, results, format)
    let field = fields.shift()
    let txtfld = field.id + '_txt'
    console.log('join', field.lovtable, field.id, txtfld)
    let db = getDb(field.lovtable)
    db.find({ }, (err, docs) => {
        if (err) return errors.badRequest(res, 'db error: ' + err)
        for (let rowx = 0; rowx < results.length; rowx++) {
            let lookup = docs.find(r => r._id == results[rowx][field.id])
            if (lookup) results[rowx][txtfld] = lookup.name || lookup.text
        }
        joinResult(res, results, format, fields)
    })
}

// format and send result as CSV, single or set
function sendResult(res, results, format) {
    var nbRecords = results.length; 
    if(format.csv) {
        if (!nbRecords) return null
        results.unshift(format.csv);
        logger.logCount(results.length || 0);
        return res.csv(results)
    }
    if (format.single) {
        logger.logCount(results.length || 0);
        return res.json(results.length?results[0]:null);
    }
    res.setHeader('_count', nbRecords);
    res.setHeader('_full_count', nbRecords && format.count ? format.count : 0)
    // TODO: find a better way to pass the total count
    if(nbRecords && format.count) results[0]["_full_count"] = format.count
    logger.logCount(results.length || 0);
    return res.json(results);
}

// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns a set of records (filtered and sorted)
function getMany(req, res) {
    logger.logReq('GET MANY', req)

    const entity = req.params.entity,
        format = req.query.format || null,
        model = getModel(res, entity)
    if (!model) return

    //let orderby = { [orderby[model.fields[0].id]]: 1 }
     let orderby = {}
         orderby[model.fields[0].id] = 1
    console.log('get all', model.table || entity, 'order by', orderby)
    
    let csvheader = (format==='csv') ? csvHeader(model.fields) : null,
        db = getDb(model.table || entity),
        total_count = 0
    db.count({}, function(err, n) {
        if (err) return errors.badRequest(res, 'db error: ' + err)
        total_count = n
    })
    // TODO: make sort case-insensitive
    db.find({}).sort(orderby).exec(function(err, docs) {
        if (err) return errors.badRequest(res, 'db error: ' + err)
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
        model = getModel(res, entity)
    if (!model) return

    console.log('get one', model.table || entity)
    const db = getDb(model.table || entity)
    db.find({ _id: id }, function(err, docs) {
        if (err) return errors.badRequest(res, 'db error: ' + err)
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
        model = getModel(res, entity)
    if (!model) return

    db = getDb(model.table || entity)
    
    if (db) {
        db.insert(data)
    }
}


// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

// - update a single record
function updateOne(req, res) {
    logger.logReq('UPDATE ONE', req)

    const entity = req.params.entity,
        id = req.params.id,
        model = getModel(res, entity)
    if (!model) return

    db = getDb(model.table || entity)
    if (db) {
        db.update({ _id: id }, data)
    }
}


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - delete a single record
function deleteOne(req, res) {
    logger.logReq('DELETE ONE', req)

    const entity = req.params.entity,
        id = req.params.id,
        model = getModel(res, entity)
    if (!model) return
    
    db = getDb(model.table || entity)
    
    if (db) {
        db.remove({ _id: id })
    }
}


// --------------------------------------------------------------------------------------
// -----------------    LIST OF VALUES   ------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns list of possible values for a field (usually for dropdown)
function lovOne(req, res) {
    logger.logReq('LOV ONE', req)

    const entity = req.params.entity,
        fid = req.params.field,
        model = getModel(res, entity)
    if (!model) return

    let field = model.fields.find(function(f) { return f.id === fid })
    if (!field) return errors.badRequest(res, 'Unknown field: ' + fid)
    console.log('get all', field.lovtable)

    let db = getDb(field.lovtable)
    db.find({ }, function(err, docs) {
        if (err) errors.badRequest(res, 'db error: ' + err)
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
        model = getModel(res, entity),
        collec = getCollection(res, model, collecId)
    if (!model || !collec) return

//    let where = { [collec.column]: pId }, 
//        orderby = { [orderby[collec.fields[0].id]]: 1 }
    let where = {}, 
        orderby = {}
    where[collec.column] = pId
    orderby[collec.fields[0].id] = 1
    console.log('get', collec.table || entity, 'where', where, 'order by', orderby)
    
    db = getDb(collec.table)
    db.find(where).sort(orderby).exec(function(err, docs) {
        if (err) return errors.badRequest(res, 'db error: ' + err)
        sendResult(res, docs, { })
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
    lovOne: lovOne

}
