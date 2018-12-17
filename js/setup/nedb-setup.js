// Evolutility-UI-React :: /views/one/all-setup.js

// load initial values into neb database
// https://github.com/louischatriot/nedb

// https://github.com/evoluteur/evolutility-ui-react
// (c) 2018 David Bennett

var nedb = require('nedb')

var models = require('../../models/all_models');
var modelsdata = require('../../models/data/all_modelsdata');
const dbpath = './nedb-data/'

// var dbt = new nedb({ filename: dbpath + 'table' + '.db', autoload: true })
// dbt.remove({}, { multi: true })
// dbt.persistence.compactDatafile()
// let dbtid = 0

let dbs = {}
let tables = []
let fields = []

for (let entity in modelsdata) {
    let model = models[entity]
    let tablename = model.table || entity
    addTable(model, 'entity', 'Sample data');
    // lov and element not done yet
    if (model.fields) {
        model.fields.forEach(f => {       
            addField(model.id, f);
        });
        writeTable(tablename, modelsdata[entity]);

        for (var i = 0; i < model.fields.length; i++) {
            let field = model.fields[i]
            if (field.type === 'lov' && field.list) {
                let lov = Object.assign({}, models['lov'])
                lov.table = field.lovtable || tablename +'_' + field.id
                addTable(lov, 'list', 'Sample data lookup');
                writeTable(lov.table, field.list);
            }
        }
    }
}
//writeTable('table', 'entity', tables, 'Master table');
dbs['table'].insert(tables, function (err, doc) { if (err) console.log(err) });
dbs['field'].insert(fields, function (err, doc) { if (err) console.log(err)});

// write set of rows as table
function writeTable(name, data) {
    console.log('Writing', name, 'rows', data.length);

    if (dbs[name]) console.log(name)
    var db = new nedb({ filename: dbpath + name + '.db', autoload: true })
    dbs[name] = db
    db.remove({}, { multi: true })
    db.persistence.compactDatafile()
    for (var i = 0; i < data.length; i++) {
        // Overwrite id, store as _id for nedb indexing
        data[i]._id = data[i].id = i + 1;
        db.insert(data[i], function (err, doc) { if (err) console.log(err) });
    }
    db.persistence.compactDatafile()
}

function addTable(model, kind, desc) {
    let dbtid = tables.length + 1
    let record = Object.assign({
        _id: dbtid,
        kind: (kind == 'entity') ? 1 : 2,
        description: desc
    }, model)
    //dbs['table'].insert(record, function (err, doc) { });
    tables.push(record)
}

function addField(tableid, field) {
    let record = Object.assign({
        _id: fields.length + 1,
        table: tableid
    }, field)
    //dbs['field'].insert(record, function (err, doc) { });
    fields.push(record)
}

