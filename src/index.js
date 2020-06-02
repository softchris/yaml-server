#!/usr/bin/env node
const argv = require("yargs").argv;
const fs = require('fs');

function getDefaultByDialect(dialect) {
  switch (dialect) {
    case 'yaml':
      return 'db.yml'
    case 'json':
      return 'db.json'
    default:
      return '';
  }
}

const { createServer, getHttpServer } = require("./server");
const dialect = argv.dialect || 'yaml';
const { dbPath } = require("./config")(getDefaultByDialect(dialect));

const port = argv.port || 3000;
const database = argv.database || dbPath;
const autoStart = argv.autoStart === 'off' ? false : true;
const hotReload = argv.hotReload === "off" ? false : true;

createServer(port, database, argv.static, autoStart, dialect);

if (hotReload) {
  fs.watchFile(database, (curr, prev) => {
    console.log("Database changed");
    getHttpServer().close(() => {
      console.log("Restarting the server");
      createServer(port, database, argv.static, autoStart);
    });
  });
}
  

