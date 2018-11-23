// Evolutility-UI-React :: /views/one/all-setup.js

// load initial values into neb database
// https://github.com/louischatriot/nedb

// https://github.com/evoluteur/evolutility-ui-react
// (c) 2018 David Bennett

var nedb = require('nedb')

var models = require('../../models/all_models');
var modelsdata = require('../../models/data/all_modelsdata');
const dbpath = './nedb-data/'

for (let entity in modelsdata) {
    let model = models[entity]
    writeTable(model.table || entity, modelsdata[entity]);

    for (var i = 0; i < model.fields.length; i++) {
        let field = model.fields[i]
        if (field.type === 'lov' && field.list) {
            writeTable(field.lovtable, field.list);
        }
    }
}

// write set of rows as table
function writeTable(name, data) {
    console.log('Writing', name, 'rows', data.length);
    var db = new nedb({ filename: dbpath + name + '.db', autoload: true })
    db.remove({}, { multi: true })
    db.persistence.compactDatafile()
    for (var i = 0; i < data.length; i++) {
        // Overwrite id, store as _id for nedb indexing
        data[i]._id = data[i].id = i + 1;
        db.insert(data[i], function (err, doc) { });
    }
    db.persistence.compactDatafile()
}

