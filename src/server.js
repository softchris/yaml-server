const express = require("express");
const YAML = require("yaml");
const fs = require("fs");
var bodyParser = require("body-parser");
const app = express();
let httpServer;

function createServer(portNumber, dbPath) {
  
  const port = portNumber || 3000;

  app.use(bodyParser.json());

  // read yml file
  const content = fs.readFileSync(dbPath, { encoding: "utf8" });
  const doc = YAML.parseDocument(content);
  const json = doc.toJSON();
  const routes = Object.keys(json);
  const routesString = routes.reduce((acc, curr) => {
    return `${acc} GET /${curr} \n GET /${curr}/:id \n PUT /${curr} \n DELETE /${curr}/:id \n\n`;
  }, "");

  app.get("/", (req, res) =>
    res.send(`Welcome to YAML Server \n
Routes available are: \n
${routesString}
`)
  );

  routes.forEach((route) => {
    app.get(`/${route}`, (req, res) => res.json(json[route]));
    app.get(`/${route}/:id`, (req, res) => {
      const foundItem = json[route].find((item) => item.id == req.params.id);
      if (!foundItem) { res.statusCode = 404; res.json({}) }
      else { res.json(foundItem); }
    });
    app.post(`/${route}`, (req, res) => {
      const posted = req.body;
      const insertObject = { ...posted, id: json[route].length + 1 };

      json[route].push(insertObject);
      fs.writeFileSync(
        dbPath,
        YAML.stringify(json)
      );
      res.statusCode = 201;
      res.json(insertObject);
    });
    app.put(`/${route}`, (req, res) => {
      const posted = req.body;
      let foundItem;
      json[route] = json[route].map((item) => {
        if (item.id === +posted.id) {
          foundItem = item;
          return { ...item, ...posted };
        }
        return item;
      });
      if (foundItem) {
        fs.writeFileSync(
          dbPath,
          YAML.stringify(json)
        );
        res.json({ ...foundItem, ...posted });
      } else {
        res.send("Item not found with ID" + posted.id);
      }
    });
    app.delete(`/${route}/:id`, (req, res) => {
      let deletedItem;
      json[route] = json[route].filter((item) => {
        if (item.id === +req.params.id) {
          deletedItem = item;
        }
        return item.id !== +req.params.id;
      });
      fs.writeFileSync(
        dbPath,
        YAML.stringify(json)
      );
      return res.json(deletedItem);
    });
  });

  httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

function getHttpServer() {
  return httpServer;
}
// TODO
// - add proper error codes for GET :id, PUT, DELETE
// - handle if a POST or PUT is done with an object not matching what's already there, can we use Joi for that?
// - add tests
// - commander or yargs
// - take in port and location of db file as params
// - finish implementing the other VERBS
// - publish

module.exports = {
  createServer,
  server: app,
  getHttpServer
};
