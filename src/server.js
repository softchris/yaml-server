const express = require("express");
const YAML = require("yaml");
const fs = require("fs");
var bodyParser = require("body-parser");
const app = express();
const chalk = require('chalk');
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
      const posted = { ...req.body, id: 0 };

      if (json[route].length > 0) {
        const [firstItem]  = json[route];
        const props = [ ...Object.keys(firstItem)].sort();
        const postedProps = Object.keys(posted).sort();

        if (JSON.stringify(props) !== JSON.stringify(postedProps)) {
          res.statusCode = 400;
          res.send('');
        }
      }

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
        res.statusCode = 404;
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

  httpServer = app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
    console.log(chalk.greenBright(routesString));
  });
}

function getHttpServer() {
  return httpServer;
}
// TODO
// - handle if a POST or PUT is done with an object not matching what's already there, can we use Joi for that?

module.exports = {
  createServer,
  server: app,
  getHttpServer
};
