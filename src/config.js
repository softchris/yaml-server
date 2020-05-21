const path = require("path");

module.exports = (dbName) => ({ dbPath: path.join(process.cwd(), dbName) });


