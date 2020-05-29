#!/usr/bin/env node
const argv = require("yargs").argv;
const fs = require('fs');
const path = require('path');

const { createServer, getHttpServer } = require("./server");
const { dbPath } = require("./config")("db.yml");

const port = argv.port || 3000;
const database = argv.database || dbPath;
const autoStart = argv.autoStart === 'off' ? false : true;
const hotReload = argv.hotReload === "off" ? false : true;

createServer(port, database, argv.static, autoStart);

if (hotReload) {
  fs.watchFile(database, (curr, prev) => {
    console.log("Database changed");
    getHttpServer().close(() => {
      console.log("Restarting the server");
      createServer(port, database, argv.static, autoStart);
    });
  });
}
  

