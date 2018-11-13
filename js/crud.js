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
function getModel(entity) {
    model = dico.getModel(entity)
    if (!model) errors.badRequest(res, 'Invalid model: "' + entity + '".')
    return model
}

// get db store for entity
function getDb(entity) {
    return new nedb({ filename: dbpath + entity + '.db', autoload: true })
}

// format and send result as CSV, single or set
function sendResult(res, results, csv, single) {
    var nbRecords = results.length; 
    if(csv) {
        if (!nbRecords) return null
        results.unshift(csv);
        logger.logCount(results.length || 0);
        return res.csv(results)
    }
    if (single) {
        logger.logCount(results.length || 0);
        return res.json(results.length?results[0]:null);
    }
    res.setHeader('_count', nbRecords);
    if(nbRecords && results[0]._full_count){
        res.setHeader('_full_count', results[0]._full_count);
    }else{
        res.setHeader('_full_count', 0);
    }
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
        model = getModel(entity)
    if (!model) return
    
    const 
        csv = (format==='csv') ? csvHeader(model.fields) : null,
        db = getDb(entity)
    db.find({}, function(err, docs) {
        if (err) errors.badRequest(res, 'Nedb error: "' + err)
        else sendResult(res, docs, csv, false)
    })
}

// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

// - get one record by ID
function getOne(req, res) {
    logger.logReq('GET ONE', req)

    const entity = req.params.entity,
        id = req.params.id,
        model = getModel(entity)
    if (!model) return
    
    const db = getDb(entity)
    db.find({ id: id }, function(err, docs) {
        if (err) errors.badRequest(res, 'Nedb error: "' + err)
        else sendResult(res, docs, null, true)
    })
}

// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - insert a single record
function insertOne(req, res) {
    // TODO: validation
    logger.logReq('INSERT ONE', req)

    const entity = req.params.entity,
        db = getDb(entity)
    
    if (db) {
        db.insert(data)
    }
}


// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

// - update a single record
function updateOne(req, res) {
    // TODO: validation
    logger.logReq('UPDATE ONE', req)

    const entity = req.params.entity,
        id = req.params.id,
        db = getDb(entity)
    
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
        db = getDb(entity)
    
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
        db = getDb(entity)
    
    if (db) {
        // TODO
    }
    const mid = req.params.entity,
        m = dico.getModel(mid),
        fid = req.params.field
    let f = m.fieldsH[fid]

}


// --------------------------------------------------------------------------------------
// -----------------    SUB-COLLECTIONS   -----------------------------------------------
// --------------------------------------------------------------------------------------

// - returns sub-collection (nested in UI but relational in DB)
function collecOne(req, res) {
    logger.logReq('GET ONE-COLLEC', req)


    const entity = req.params.entity,
        fid = req.params.field,
        fid = req.params.field,
        db = getDb(entity)

    let f = m.fieldsH[fid]
        
    if (db) {
        // TODO
    }
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
