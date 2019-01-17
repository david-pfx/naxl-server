/*! *******************************************************
 *
 * evolutility-server-node :: utils/upload.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const path = require('path'),
    formidable = require('formidable'),
    shortid = require('shortid'),
    fs = require('fs'),
    dico = require('./dico'),
    ft = dico.fieldTypes,
    logger = require('./logger'),
    config = require('../../config.js'),
    { promiseModel, sendError } = require('../nedb-crud'),
    parseContent = require('./parse-content')

module.exports = {  

    // - save uploaded file to server (no DB involved)
    uploadOne: function uploadOne(req, res){
        logger.logReq('UPLOAD ONE', req);

        const entity = req.params.entity,
            id = req.params.id,
            fieldid = req.query.field,
            form = new formidable.IncomingForm()

        //logger.log('upload', entity, id, form.uploadDir, form.encoding, form.type)
        promiseModel(entity)
        .then(m => {
            let originalName,
                fname,
                ffname,
                dup = false

            form.multiples = false;
            form.uploadDir = path.join(config.uploadPath, '/'+m.entity);

            form.on('file', function(field, file) {
                fname = originalName = file.name;
                ffname = form.uploadDir+'/'+fname;

                if(fs.existsSync(ffname)){
                    // - if duplicate name do not overwrite file but postfix name
                    let idx = ffname.lastIndexOf('.')
                    const xtra = '_'+shortid.generate()

                    dup = true;
                    ffname = idx ? (ffname.slice(0, idx)+xtra+ffname.slice(idx)) : (ffname+xtra);
                    idx = ffname.lastIndexOf('/');
                    fname = ffname.slice(idx+1);
                    logger.logSuccess('New file name: "'+originalName+'" -> "'+fname+'".')
                }
                fs.rename(file.path, ffname, function (err) {
                    if (err) throw err;
                });
            })
            .on('end', function(){
                logger.logSuccess('Saved file: "'+ffname+'".')
                let result = {
                    duplicate: dup,
                    fileName: fname,
                    id: id,
                    model: m.entity,
                }
                let field = m.fieldsH[fieldid]
                if (field.type === ft.content) {
                    parseContent.parseCsv(ffname, (data, err) => {
                        if (err) throw err;
                        result.newdata = parseContent.createModel(originalName, data[0])
                        res.json(result)
                    })
                } else res.json(result);
            })
            .on('error', function(err) {
                logger.logError(err);
                res.json({
                    error: true,
                    uploaded: false
                });
            });
            form.parse(req);
        })
        .catch(err => { return sendError(res, err) })

    }

}

