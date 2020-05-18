![Coverage](./badges/coverage.svg)
[![npm version](https://badge.fury.io/js/yaml-server.svg)](https://www.npmjs.com/package/yaml-server)
[![npm downloads](https://img.shields.io/npm/dm/yaml-server?color=blue&label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/yaml-server)
[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?color=blue&style=flat-square)](http://opensource.org/licenses/MIT)

A command line tool that create a REST server based on a YAML file.

## Install

Either install it globally with:

```bash
npm install -g yaml-server
```

OR use `NPX`

```bash
npx yaml-server --port 3000 --database ./db.yml
```

## Routes

Routes are first level elements. Consider the following example file:

```yml
products:
  - id: 1
    name: tomato
  - id: 2
    name: lettuce
orders:
  - id: 1
    name: order1
  - id: 2
    name: order2
```

This will produce routes `/products`, `/orders`. Below is a table of supported operations with `products` as example resource. The same operations are also supports for `orders/`.

| VERB     |Route          | Input      | Output             |
|----------|---------------|------------|--------------------|
| GET      | /products     | *None*     | **Array**          |
| GET      | /products/:id |  **e.g 3** | **Object**         |
| POST     | /products     | **object** | **Created object** |
| PUT      | /products     | **object** | **Updated object** |
| DELETE   | /products/1   | **e.g 3**  | **Deleted object** |
