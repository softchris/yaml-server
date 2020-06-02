const YAML = require('yaml');

module.exports = {
  toJson(content, dialect) {
    if (dialect === 'yaml') {
      const doc = YAML.parseDocument(content);
      json = doc.toJSON();
      return json;
    } 
    return JSON.parse(content); // just return JSON
  },
  transform(content, dialect) {
    if (dialect === 'yaml') {
      return YAML.stringify(content);
    }
  }
}