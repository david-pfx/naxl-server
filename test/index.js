// index.js -- unit testing master

const request = require('supertest'),
    test = require('tape')

const runtest = require('./common'),
    logger = require('../js/utils/logger')

    logger.setEnable(false)

require('./smoke') 

test('Begin tests!', t => {
    t.end()
})
require('./suite1')
require('./suite2')
require('./suite3')

test('End tests!', t => {
    t.end()
})
