// process dropped content file

// (c) 2019 Datid Bennett

let fs = require('fs')
let parse = require('csv-parser')

// simple logging function, easy to disable
function logall(...args) {
    console.log(...args)
}

module.exports = {
    // get a single item
    parseCsv: function(filePath, cbok, cberr) {
        logall('parseCsv', filePath)
        let input = fs.createReadStream(filePath)
        if (!input) return cberr(`cannot open ${filePath}`)
        let parser = parse({
            columns: true,
            to: 10,
        })
        let output = []
        input.pipe(parser)
        .on('data', chunk => {
            //logall('parseCsv', chunk)
            output.push(chunk)
        })
        .on('error', err => {
            logall('parseCsv', err)
            cberr(err)
        })
        .on('end', () => {
            logall('parseCsv', output.length)
            cbok(output)
        })
    },

    // Create a moodel from the keys of a data row object
    createModel: function(filename, row) {
        // title case function
        let tc = str => str.replace(/\b\w+/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase() )

        // get rid of known extension
        let name = filename.replace(/[.]csv$/i, '')
        // create fields from CSV row
        let fields = Object.keys(row).map(k => {
            return {
                "id": k,
                "type": "text",
                "label": tc(k),
                "inMany": true,
            }
        })
        return result = {
            "entity": name.toLowerCase(),
            "active": true,  // set later?
            "label": tc(name),
            "kind": 1,
            "fields": fields
        }        
    },   
}