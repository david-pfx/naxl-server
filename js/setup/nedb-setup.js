// Evolutility-UI-React :: /views/one/all-setup.js

// load initial values into neb database
// https://github.com/louischatriot/nedb

// https://github.com/evoluteur/evolutility-ui-react
// (c) 2018 David Bennett

var nedb = require('nedb')

var modelsdata = require('../../models/data/all_modelsdata');
const dbpath = './nedb-data/'

for (let entity in modelsdata) {
    //console.log(entity)
    var db = new nedb({ filename: dbpath + entity + '.db', autoload: true })
    // db.loadDatabase(function(err) {
    //     console.log('Error: ', err)
    // })
    db.remove({}, { multi: true })
    db.persistence.compactDatafile()
    let data = modelsdata[entity]
    console.log(entity, 'rows:', data.length)
    for (var i = 0; i < data.length; i++) {
        data[i]['_id'] = i
        db.insert(data[i], function(err, doc) {
            //console.log(doc)
        })
    }
}
