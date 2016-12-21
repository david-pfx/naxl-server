/*! *******************************************************
 *
 * evolutility-server-node :: utils/orm.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * Copyright (c) 2016 Olivier Giulieri
 ********************************************************* */

var pg = require('pg'),
    path = require('path'),
    formidable = require('formidable'),
    shortid = require('shortid'),
    fs = require('fs'),
    parseConnection = require('pg-connection-string').parse,
    csv = require('express-csv'),
    _ = require('underscore'),
    dico = require('./dico'),
    logger = require('./logger');

var config = require('../../config.js'),
    models = require('../../models/all_models');

var dbConfig = parseConnection(config.connectionString)
dbConfig.max = 10; // max number of clients in the pool 
dbConfig.idleTimeoutMillis = 30000; // max client idle time before being closed

var schema = '"'+(config.schema || 'evol_demo')+'"',
    defaultPageSize = config.pageSize || 50,
    lovSize = config.lovSize || 100;

var pool = new pg.Pool(dbConfig);

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack)
})

function getModel(mId){ 
// - return a model enhanced w/ hashs
    var m = dico.prepModel(models[mId]);
    m.fields.forEach(function(f, idx){
        if(f.type==='lov'){
            f.t2 = 't_'+idx
        }
    })
    m.schemaTable = schema+'."'+(m.table || m.id)+'"';
    return m;
}

function sqlQuery(q){
    var sql = 'SELECT '+q.select+
        ' FROM '+q.from;
    if(q.where.length){
        sql += ' WHERE '+q.where.join(' AND ');
    }
    if(q.group) {sql += ' GROUP BY '+q.group;}
    if(q.order) {sql += ' ORDER BY '+q.order;}
    sql += ' LIMIT '+(q.limit || defaultPageSize);
    if(q.offset) {sql += ' OFFSET '+parseInt(q.offset, 10);}
    return sql;
}

function runQuery(res, sql, values, singleRecord, format, header){
// - run a query and return the result in request
    var results = [];

    // Get a Postgres client from the connection pool 
    pool.connect(function(err, client, done) {

        // SQL Query > Select Data
        logger.logSQL(sql);
        var query = values ? client.query(sql, values) : client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            if(format==='csv'){
                if(header){
                    var headers={};
                    for (key in results[0]) {
                        headers[key] = header[key] || key;
                    }
                    results.unshift(headers);
                    return res.csv(results);
                }else{
                    return res.csv(results);
                }
            }else if(singleRecord){
                return res.json(results[0]);
            }else{
                res.setHeader('_full_count', 'aaaaaa')
                return res.json(results);
            }
        });

        // Handle Errors
        if(err) {
            done();
            res.status(500).send('Something broke!');
            logger.logError(err);
        }

    });

}

function csvHeader(fields){
// - build the header row for CSV export
    var h = {'id': 'ID'},
        lovs = {}
    _.forEach(fields, function(f){
        if(f.type==='lov'){
            h[f.id] = (f.label || f.id)+' ID';
            h[f.id+'_txt'] = f.label || f.id;
        }else{
            h[f.id] = f.label || f.id;
        }
    });
    return h;
}

function sqlSelect(fields, collecs, table, action){
// - generate the SELECT clause
    var sql,
        sqlfs=[],
        tQuote = table ? 't1."' : '"';
    _.forEach(fields, function(f, idx){
        if(f.type==='lov' && action!=='C' && action!=='U'){
            sqlfs.push(f.t2+'.'+(f.lovcolumn ? f.lovcolumn : 'name')+' AS "'+f.id+'_txt"')
        }
        sql = tQuote+f.column
        //if(f.type==='money'){
            //sql += '"::money'
        //}else if(f.type==='integer'){
            //sql += '"::integer'
        //}else if(f.type==='decimal'){
            //sql += '"::float'
        //}else{
            sql += '"'
        //}
        if(f.column && f.id!=f.column){
            sql += ' AS "'+f.id+'"'
        }
        sqlfs.push(sql);
    });/*
    if(collecs){
        sqlfs=sqlfs.concat(_.map(collecs, function(c){
            return tQuote+(c.column||c.id)+'"';
        }));
    }*/
    return sqlfs.join(',');
}

// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

function sqlOrderColumn(f){
// - generate sql ORDER BY clause for 1 field
    if(f){
        if(f.type==='lov' && f.lovtable){
            return '"'+f.id+'_txt"';
        }else{
            var col = 't1."'+f.column+'"';
            if(f.type==='boolean'){
                return 'CASE WHEN '+col+'=TRUE THEN TRUE ELSE FALSE END'
            }else if(f.type==='text'){
                // TODO: better way?
                return 'LOWER('+col+')'
            }
            return col;
        }
        return 'id';
    }
}

function sqlOrderFields(m, fullOrder){
// - generate sql ORDER BY clause for many fields
    var fs = m.fields,
        qos = fullOrder.split(',');

    return qos.map(function(qo){
        var ows = qo.split('.'),
            f = m.fieldsH[ows[0]],
            col = f ? sqlOrderColumn(f) : 'id' // -- sort by id if invalid param
        if(ows.length===1){
            return col
        }else{
            return col + (ows[1]==='desc'?' DESC':' ASC')
        }
    }).join(',')
}

function sqlFromLOVs(fields){
// - generates list of joined tables for lov fields
    var sql = '';
    fields.forEach(function(f, idx){
        if(f.type==='lov' && f.lovtable){
            sql += ' LEFT JOIN '+schema+'."'+f.lovtable+'" AS '+f.t2+
                        ' ON t1."'+f.column+'"='+f.t2+'.id'
        }
    })
    return sql;
}

function sqlMany(m, req, allFields, wCount){
// - generates SQL for query returning a set of records
    var fs=allFields ? m.fields : m.fields.filter(dico.isFieldMany)
    var sqlParams=[];

    // ---- SELECTION
    var sqlSel = 't1.id, '+sqlSelect(fs, false, true)
    // - full_count is included after
    if(wCount){
        sqlSel += ',count(*) OVER()::integer AS _full_count';
    }
    var sqlFrom = m.schemaTable + ' AS t1' + sqlFromLOVs(fs);

    // ---- FILTERING
    var sqlOperators = {
        'eq': '=',
        'ne': '<>',
        'gt': '>',
        'lt': '<',
        'gte': '>=',
        'lte': '<=',
        'ct': ' ILIKE ',
        'sw': ' ILIKE ',
        'fw': ' ILIKE ',
        'in': ' IN ',
        '0': '=',
        '1': '=',
        'null': ' IS ',
        'nn': ' IS '
    };
    var sqlWs = [];
    var ffs = _.forEach(req.query, function(c, n){
        var f = (n==='id') ? {column:'id'} : m.fieldsH[n];
        if(f && ['select', 'filter', 'search', 'order', 'page', 'pageSize'].indexOf(f)<0){
            var cs=c.split('.');
            if(cs.length){
                var cond=cs[0];
                if(sqlOperators[cond]){
                    if((cond==='eq' || cond==='ne') && dico.fieldIsText(f)){
                        sqlParams.push(cs[1]);
                        if(f.type==='text' || f.type==='textmultiline' || f.type==='html'){
                            sqlWs.push('LOWER(t1."'+f.column+'")'+sqlOperators[cond]+'LOWER($'+sqlParams.length+')');
                        }else{
                            sqlWs.push('t1."'+f.column+'"'+sqlOperators[cond]+'$'+sqlParams.length);
                        }
                    }else{
                        var w='t1."'+f.column+'"'+sqlOperators[cond];
                        if(cond==='in' && (f.type==='lov' || f.type==='list')){
                            sqlWs.push(w+'('+cs[1].split(',').map(function(li){
                                return "'"+li.replace(/'/g, "''")+"'";
                            }).join(',')+')'); 
                        }else if(cond==='0'){ // false
                            sqlWs.push(w+'false');
                        }else if(cond==='1'){ // true
                            sqlWs.push(w+'true');
                        }else if(cond==='null'){ // empty        
                            sqlWs.push(' NOT '+w+'NULL');
                        }else{
                            if(cond==='nct'){ // not contains
                                //TODO replace % in cs[1]
                                sqlParams.push('%'+cs[1]+'%');
                                sqlWs.push(' NOT '+w+'$'+sqlParams.length);
                            }else{
                                if(cond==='sw'){ // start with
                                    sqlParams.push(cs[1]+'%');
                                }else if(cond==='fw'){ // finishes with
                                    sqlParams.push('%'+cs[1]);
                                }else if(cond==='ct'){ // contains
                                    sqlParams.push('%'+cs[1]+'%');
                                }else{
                                    sqlParams.push(cs[1]);
                                }
                                sqlWs.push(w+'$'+sqlParams.length);
                            }
                        }
                    }
                }else{
                    console.log('Invalid condition "'+cond+'"')
                }
            }
        }
    });

    // ---- SEARCHING
    if(req.query.search){
        // TODO: use fts
        var paramSearch = false,
            sqlWsSearch = [];

        if(m.searchFields && _.isArray(m.searchFields)){
            logger.logObject('search fields', m.searchFields);
            var sqlP='"'+sqlOperators.ct+'($'+(sqlParams.length+1)+')';
            _.forEach(m.searchFields, function(fid){
                sqlWsSearch.push('t1."'+m.fieldsH[fid].column+sqlP);
            });
            sqlParams.push('%'+req.query.search.replace(/%/g, '\%')+'%');
            sqlWs.push('('+sqlWsSearch.join(' OR ')+')');
        }
    }

    // ---- RECORD COUNT (added to selection)
    if(wCount){
        if(sqlWs.length){
            sqlSel += ',(SELECT count(*) FROM '+m.schemaTable+')::integer AS _full_count';
        }else{
            sqlSel += ',count(*) OVER()::integer AS _full_count';
        }
    }
    
    // ---- ORDERING
    sqlOrder='';
    var qOrder=req.query?req.query.order:null;
    if(qOrder){
        if(qOrder.indexOf(',')>-1){
            var qOs=qOrder.split(',');
            sqlOrder+=_.map(qOs, function(qo){
                    return sqlOrderFields(m, qo)
                }).join(',');
        }else{
            sqlOrder+=sqlOrderFields(m, qOrder);
        }
    }else{
        var fCol='t1."'+fs[0].column+'"';
        if(fs[0].type==='text'){
            fCol='UPPER('+fCol+')';
        }
        sqlOrder = fCol+' ASC';
    }

    // ---- LIMITING & PAGINATION
    var offset=0,
        query=req.query,
        qPage=query.page||0, 
        qPageSize;

    var format = query.format || null;
    if(format==='csv'){
        qPageSize = config.csvSize || 1000;
    }else{
        qPageSize = parseInt(query.pageSize || defaultPageSize, 10);
        if(qPage){
            offset = qPage*qPageSize;
        }
    }

    return {
        select: sqlSel,
        from: sqlFrom,
        where: sqlWs, //array
        group: '',
        order: sqlOrder,
        limit: qPageSize,
        offset: offset,
        params: sqlParams
    }
}

function getMany(req, res) {
// - returns a set of records (filtered and sorted)
    logger.logReq('GET MANY', req);
    var m = getModel(req.params.entity);
    if(m){
        var format = req.query.format || null,
            isCSV = format==='csv',
            sq = sqlMany(m, req, isCSV, !isCSV),
            sql = sqlQuery(sq);

        runQuery(res, sql, sq.params, false, format, isCSV ? csvHeader(m.fields) : null);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    GET CHARTS   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function chartMany(req, res) {
// - returns data for a single charts
    logger.logReq('GET CHART', req);

    var m = getModel(req.params.entity),
        fid = req.params.field,
        sqlParams = [],
        sql;

    if(m && fid){
        var f = m.fieldsH[fid];
        if(f){
            if(f.type==='lov' && f.lovtable){
                var clov = f.lovcolumn||'name';
                sql='SELECT t2.id, t2.'+clov+'::text AS label, count(*)::integer AS value'+
                    ' FROM '+m.schemaTable+' AS t1'+
                    ' LEFT JOIN '+schema+'.'+f.lovtable+' AS t2'+
                        ' ON t1.'+f.column+'=t2.id'+
                    ' GROUP BY t2.id, t2.'+clov
            }else{
                var lbl = '"'+f.column+'"';
                if(f.type==='boolean'){
                    lbl='CASE '+lbl+' WHEN true THEN \'Yes\' ELSE \'No\' END'
                }
                sql='SELECT '+lbl+'::text AS label, count(*)::integer AS value'+
                    ' FROM '+m.schemaTable+' AS t1'+
                    ' GROUP BY '+lbl;
            }
            sql += ' ORDER BY label ASC'+
                   ' LIMIT '+defaultPageSize+';';

            runQuery(res, sql, sqlParams, false);
        }
    }else{
        return res.json(logger.errorMsg('Invalid entity or field.', 'chartMany'));
    }

}


// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

function getOne(req, res) {
// - get one record by ID
    logger.logReq('GET ONE', req);

    var m = getModel(req.params.entity),
        id = req.params.id;

    if(m && id){
        var sqlParams = [id];
        var sql='SELECT t1.id, '+sqlSelect(m.fields, m.collecs, true)+
                ' FROM '+m.schemaTable+' AS t1'+sqlFromLOVs(m.fields)+
                ' WHERE t1.id=$1'+
                ' LIMIT 1;';

        runQuery(res, sql, sqlParams, true);        
    }else{
        return res.json(logger.errorMsg('Invalid entity \''+entity+'\'or field\''+fid+'\'.', 'getOne'));
    }

}


// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function prepData(m, req, fnName, action){
// - generates lists of names and values (for insert or update)
    var ns = [],
        vs = [];

    _.forEach(m.fields, function(f){
        if(f.column!='id' && f.type!='formula' && !f.readOnly){
            var fv=req.body[f.id];
            if(fv!=null){
                switch(f.type){
                    case 'panel-list':
                        vs.push(JSON.stringify(fv));
                        ns.push(fnName(f, vs.length));
                        break;
                    case 'boolean':
                        vs.push((fv&&fv!=='false')?'TRUE':'FALSE');
                        ns.push(fnName(f, vs.length));
                        break;
                    case 'date':
                    case 'time':
                    case 'datetime':
                    case 'lov':
                        vs.push((!fv)?null:fv);
                        ns.push(fnName(f, vs.length));
                        break;
                    default:
                        vs.push(fv);
                        ns.push(fnName(f, vs.length));
                }
            }
        }
    });
    _.forEach(m.collecs, function(f){
        var fv=req.body[f.id];
        if(fv!=null){
            vs.push(JSON.stringify(fv));
            ns.push(fnName(f, vs.length));
        }
    });
    return {
        names: ns,
        values: vs
    };
}

function insertOne(req, res) {
// - insert a single record
    logger.logReq('INSERT ONE', req);

    var m = getModel(req.params.entity),
        q = prepData(m, req, function(f){return f.column;}, 'C');

    if(m && q.names.length){
        var ps=_.map(q.names, function(n, idx){
            return '$'+(idx+1);
        });
        var sql = 'INSERT INTO '+m.schemaTable+
            ' ("'+q.names.join('","')+'") values('+ps.join(',')+')'+
            ' RETURNING id, '+sqlSelect(m.fields, false, null, 'C')+';';

        runQuery(res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

function updateOne(req, res) {
// - update a single record
    logger.logReq('UPDATE ONE', req);

    var m = getModel(req.params.entity),
        id = req.params.id,
        q = prepData(m, req, function(f, idx){return '"'+f.column+'"=$'+idx;}, 'U');

    if(m && id && q.names.length){
        q.values.push(id);
        var sql = 'UPDATE '+m.schemaTable+' AS t1 SET '+ q.names.join(',') + 
            ' WHERE id=$'+q.values.length+
            ' RETURNING id, '+sqlSelect(m.fields, false, null, 'U')+';';
        runQuery(res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    FILE UPLOAD ONE    ----------------------------------------------
// --------------------------------------------------------------------------------------

function uploadOne(req, res){
// - save uploaded file to server (no DB involved)
    logger.logReq('UPLOAD ONE', req);

    var m = getModel(req.params.entity),
        id = req.params.id,
        form = new formidable.IncomingForm(),
        fname,
        dup = false;

    form.multiples = false;
    form.uploadDir = path.join(config.uploadPath, '/'+m.id);

    form.on('file', function(field, file) {
        fname = file.name;
        ffname = form.uploadDir+'/'+fname;

        if (fs.existsSync(ffname)) {
            // - if duplicate do not overwrite file but postfix name
            var idx = ffname.lastIndexOf('.'),
                xtra = '_'+shortid.generate(),
                originalName = fname;

            dup = true;
            ffname = idx ? (ffname.slice(0, idx)+xtra+ffname.slice(idx)) : (ffname+xtra);
            idx = ffname.lastIndexOf('/');
            fname = ffname.slice(idx+1);
            console.log('No Dup: "'+originalName+'" -> "'+fname+'".')
        }
        fs.rename(file.path, ffname);
    })
    .on('end', function(){
        res.json({
            duplicate: dup,
            fileName: fname,
            id: id,
            model: m.id
        });
    })
    .on('error', function(err) {
        logger.logError(err);
        res.json({
            error: true,
            uploaded: false
        });
    });

    form.parse(req);
};


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function deleteOne(req, res) {
// - delete a single record
    logger.logReq('DELETE ONE', req);

    var m = getModel(req.params.entity),
        id = req.params.id;

    if(m && id){
        // SQL Query > Delete Data
        var sql = 'DELETE FROM '+m.schemaTable+
            ' WHERE id=$1 RETURNING id::integer AS id;';
        runQuery(res, sql, [id], true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    LIST OF VALUES   ------------------------------------------------
// --------------------------------------------------------------------------------------

function lovOne(req, res) {
// - returns list of possible values for a field (usually for dropdown)
    logger.logReq('LOV ONE', req);

    var entity = req.params.entity,
        m = getModel(entity),
        fid = req.params.field,
        f = m.fieldsH[fid];

    if(m){
        if(!f && fid===entity){
            // -- if field id = entity id, then return the entity as a lov
            f = {
                id: 'entity',
                lovcolumn: m.fields[0].column,
                lovtable: m.table
            }
        }
        if(f){
            var col = f.lovcolumn||'name';
            var sql = 'SELECT id, "'+col+'" as text'
            if(f.lovicon){
                sql+=',icon'
            }
            sql+=' FROM '+schema+'."'+f.lovtable+
                '" ORDER BY UPPER("'+col+'") ASC LIMIT '+lovSize+';';
            runQuery(res, sql, null, false);
        }else{
            res.json(logger.errorMsg('Invalid field \''+fid+'\'.', 'lovOne'));
        }
    }else{
        res.json(logger.errorMsg('Invalid entity \''+entity+'\'.', 'lovOne'));
    }

}


// --------------------------------------------------------------------------------------
// -----------------    SUB-COLLECTIONS   -----------------------------------------------
// --------------------------------------------------------------------------------------

function collecOne(req, res) {
// - returns sub-collection (nested in UI but relational in DB)
    logger.logReq('GET ONE-COLLEC', req);

    var m = getModel(req.params.entity),
        collecId = req.params.collec,
        collec = m.collecsH[collecId]
        pId = parseInt(req.query.id, 10);

    if(m && collec){
        var sqlParams = [pId];
        var sql = 'SELECT t1.id, '+sqlSelect(collec.fields)+
                ' FROM '+schema+'."'+collec.table+'" AS t1'+//lovs.from+
                ' WHERE t1."'+collec.column+'"=$1'+
                ' ORDER BY t1.id'+//t1.position, t1.id
                ' LIMIT '+defaultPageSize+';';

        runQuery(res, sql, sqlParams, false);        
    }else{
        return res.json(logger.errorMsg('Invalid parameters.', 'collecOne'));
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

    // - File upload
    uploadOne: uploadOne,

    // - Sub-collections
    getCollec: collecOne,

    // - Charts
    chartMany: chartMany,

    // - LOVs (for dropdowns)
    lovOne: lovOne

}
