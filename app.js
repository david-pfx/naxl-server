/*
  ______          _           _ _ _
 |  ____|        | |      /| (_) (_)/|
 | |____   _____ | |_   _| |_ _| |_| |_ _   _
 |  __\ \ / / _ \| | | | | __| | | | __| | | |
 | |___\ V / (_) | | |_| | |_| | | | |_| |_| |
 |______\_/ \___/|_|\__,_|\__|_|_|_|\__|\__, |
         ___  ___ _ ____   _____ _ __    __/ |
  ____  / __|/ _ \ '__\ \ / / _ \ '__|  |___/
 |____| \__ \  __/ |   \ V /  __/ |
        |___/\___|_|    \_/ \___|_| 

* https://github.com/evoluteur/evolutility-server-node
* (c) 2018 Olivier Giulieri
*/

const express = require('express'),
    path = require('path'),
    helmet = require('helmet'),
    bodyParser = require('body-parser');

var routes = require('./js/routes'),
    config = require('./config')

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static file if found, else fall through
// TODO: better way of loading the React bundle.js
app.use(express.static(config.publicPath, { fallthrough: true }));
//app.use(express.static(path.join(__dirname, '../evolutility-ui-react', 'public'), { fallthrough: true }));
//app.use(express.static(path.join(__dirname, './client', 'public')));

// prevent denial of cross origin requests
// TODO: REMOVE IF UNNECESSARY
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //res.header("Access-Control-Request-Headers", "X-Requested-With,Access-Control-Request-Method,Access-Control-Request-Headers, accept, Content-Type");
  next();
});

// Handle API routing
app.use('/', routes);

// Handle errors
var dev = (app.get('env') != 'production')
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    if (dev) res.send(err)
    else res.send('unexpected error')
})

module.exports = app;
