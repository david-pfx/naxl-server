// load initial values into neb database
// https://github.com/louischatriot/nedb

// https://github.com/evoluteur/evolutility-ui-react
// (c) 2018 David Bennett

let nedb = require('nedb'),
    fs = require('fs')

let models = require('./models/all_models'),
    modelsdata = require('./data/all_data'),
    dico = require('../js/utils/dico')
const dbpath = './nedb-data/'
    
// set this true to create a separate fields table
// also uncomment entries in models and data
const hasfieldtable = true,
    deleteall = true

let dbs = {},
    tables = [], 
    fields = []

main()

function main() {
    if (deleteall) {
        let regex = /[.]db$/
        fs.readdirSync(dbpath)
            .filter(f => regex.test(f))
            .map(f => fs.unlinkSync(dbpath + f))
    }
    let nofields = (({ fields, ...others }) => ({ ...others })) //!!!
    for (let entity in modelsdata) {
        let model = models[entity]
        let tablename = model.table || entity
        let label = model.label || model.name || entity
        writeTable(tablename, modelsdata[entity])
        if (hasfieldtable) {
            addTable(nofields(model), 'entity', `Sample data for ${label}`)
            addFields(model, tables.length)
        } else
            addTable(model, 'entity', `Sample data for ${label}`)
    }
    rewriteTable('table', tables)
    if (hasfieldtable)
        rewriteTable('field', fields)
}

function rewriteTable(name, content) {
    console.log(`Rewriting ${name} rows`, content.length)
    dbs[name].insert(content, function (err, doc) { 
        if (err) console.log(err) 
    })
}

// write set of rows as table
function writeTable(name, data) {
    console.log('Writing', name, 'rows', data.length)

    if (dbs[name]) console.log(name)
    var db = new nedb({ filename: dbpath + name + '.db', autoload: true })
    dbs[name] = db
    db.remove({}, { multi: true })
    db.persistence.compactDatafile()
    for (var i = 0; i < data.length; i++) {
        let record = prepareAdd(data[i], i + 1)
        db.insert(record, function (err, doc) { if (err) console.log(err) })
    }
    db.persistence.compactDatafile()
}

// add a row to the table of tables
// note that in the table id===_id and entity is the id key for the model.
function addTable(model, kind, desc) {
    tables.push(dico.toTableRow(model, tables.length + 1, kind, desc))
}

// add a row to the table of fields
// note that in the table id===_id, entity is the id for the model, table_id links to the table row
function addFields(model, tableid) {
    model.fields.map(f => fields.push(dico.toFieldRow(f, fields.length + 1, tableid)))
}

// _id is the required key, always an integer, use id if possible
// id is the required user-visible key, same as _id if missing
function prepareAdd(data, id) {
    data._id = (+data.id > 0) ? +data.id : id
    if (!data.id) data.id = data._id
    else if (+data.id > 0) data.id = +data.id
    return data
}


