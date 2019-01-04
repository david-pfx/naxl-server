// load initial values into neb database
// https://github.com/louischatriot/nedb

// https://github.com/evoluteur/evolutility-ui-react
// (c) 2018 David Bennett

var nedb = require('nedb')

var models = require('./models/all_models');
var modelsdata = require('./data/all_modelsdata');
const dbpath = './nedb-data/'

let dbs = {}
let tables = []

for (let entity in modelsdata) {
    let model = models[entity]
    let tablename = model.table || entity
    addTable(model, 'entity', `Sample data for ${model.label}`);
    writeTable(tablename, modelsdata[entity]);
}

dbs['table'].insert(tables, function (err, doc) { 
    if (err) console.log(err) 
});

// write set of rows as table
function writeTable(name, data) {
    console.log('Writing', name, 'rows', data.length);

    if (dbs[name]) console.log(name)
    var db = new nedb({ filename: dbpath + name + '.db', autoload: true })
    dbs[name] = db
    db.remove({}, { multi: true })
    db.persistence.compactDatafile()
    for (var i = 0; i < data.length; i++) {
        let record = prepareAdd(data[i], i + 1)
        db.insert(record, function (err, doc) { if (err) console.log(err) });
    }
    db.persistence.compactDatafile()
}

// add a row to the table of tables
// note that in the table id===_id and modelid carries the id for the model.
function addTable(model, kind, desc) {
    let dbtid = tables.length + 1
    let record = Object.assign({}, model, {
        _id: dbtid,
        id: dbtid,
        modelid: model.id,
        kind: (kind == 'entity') ? 1 : 2,
        description: desc
    })
    tables.push(record)
}

// _id is the required key, always an integer, use id if possible
// id is the required user-visible key, same as _id if missing
function prepareAdd(data, id) {
    data._id = (+data.id > 0) ? +data.id : id
    if (!data.id) data.id = data._id
    else if (+data.id > 0) data.id = +data.id
    return data
}


