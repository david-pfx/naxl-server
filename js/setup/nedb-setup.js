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
    let name = model.table || entity
    addTable(name, 'entity', 'Sample data');
    model.fields.forEach(f => {       
        addField(name, f);
    });
    writeTable(name, modelsdata[entity]);

    for (var i = 0; i < model.fields.length; i++) {
        let field = model.fields[i]
        if (field.type === 'lov' && field.list) {
            addTable(field.lovtable, 'list', 'Sample data lookup');
            writeTable(field.lovtable, field.list);
        }
    }
}
//writeTable('table', 'entity', tables, 'Master table');
dbs['table'].insert(tables, function (err, doc) { });
dbs['field'].insert(fields, function (err, doc) { });

// write set of rows as table
function writeTable(name, data) {
    console.log('Writing', name, 'rows', data.length);

    var db = new nedb({ filename: dbpath + name + '.db', autoload: true })
    dbs[name] = db
    db.remove({}, { multi: true })
    db.persistence.compactDatafile()
    for (var i = 0; i < data.length; i++) {
        // Overwrite id, store as _id for nedb indexing
        data[i]._id = data[i].id = i + 1;
        db.insert(data[i], function (err, doc) { });
    }
    db.persistence.compactDatafile()
}

function addTable(name, kind, desc) {
    let dbtid = tables.length + 1
    tables.push({
        _id: dbtid,
        id: name,
        name: name.substring(0, 1).toUpperCase() + name.substring(1).replace('_', ' '),
        kind: (kind == 'entity') ? 1 : 2,
        table: name,
        description: desc
    });
}

function addField(table, field) {
    field._id = fields.length + 1
    field.table = table
    fields.push(field);
}

