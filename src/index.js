#!/usr/bin/env node

const argv = require("yargs").argv;

const { createServer } = require('./server');
const { dbPath } = require('./config')('db.yml');

const port = argv.port || 3000;
const database = argv.database || dbPath

createServer(port, database);