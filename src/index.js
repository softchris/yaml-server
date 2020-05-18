#!/usr/bin/env node

// yargs
const { createServer } = require('./server');
const { dbPath } = require('./config')('db.yml');

createServer(8000, dbPath);