const { createServer, getHttpServer } = require("../server");
const path = require("path");
const fs = require("fs");
const supertest = require("supertest");
const jsonOption = {
  dialect: 'json',
  dbFilename: 'db.json'
};

const ymlOption = {
  dialect: 'yaml',
  dbFilename: 'db.yml'
};

function createOption(option) {
  if (option === 'yaml') {
    return ymlOption
  } else if (option === 'json') {
    return jsonOption;
  } else {
    throw new Error(`Unknown option ${option}`)
  }
}

const selectedOption = createOption('json');

const server = createServer(
  3000, 
  path.join(__dirname, selectedOption.dbFilename), 
  ".", 
  false, 
  selectedOption.dialect
);

const request = supertest(server);

function restore(dialect) {
  if (dialect === 'yaml') {
    const original = fs.readFileSync(path.join(__dirname, "original-db.yml"));
    fs.writeFileSync(path.join(__dirname, "db.yml"), original);
  } else if (dialect === 'json') {
    const original = fs.readFileSync(path.join(__dirname, "original-db.json"));
    fs.writeFileSync(path.join(__dirname, "db.json"), original);
  }
}

describe("server", () => {
  afterAll(async(done) => {
    // restore yml
    // TODO, ensure we have an original based on dialect
    // const original = fs.readFileSync(path.join(__dirname, "original-db.yml"));
    // fs.writeFileSync(path.join(__dirname, "db.yml"), original);
    restore(selectedOption.dialect);
    getHttpServer().close(() => {
      console.log("server closed!");
      done();
    });
  });

  test("should return products", async(done) => {
    const products = [{
      id: 1,
      name: "tomato"
    }, {
      id: 2,
      name: "lettuce"
    }];

    const res = await request.get("/products");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
    done();
  });

  test("should sort the data based on sortOrder and sortKey", async () => {
    const expected = [{ id: 2, name: 'lettuce' }, { id: 1, name: 'tomato' }];

    const res = await request.get('/products?sortOrder=ASC&sortKey=name')
    expect(expected).toEqual(res.body);
  })

  test("should sort the data based on sortOrder and sortKey - DESCENDING", async () => {
    const expected = [{ id: 1, name: 'tomato' }, { id: 2, name: 'lettuce' }];

    const res = await request.get('/products?sortOrder=DESC&sortKey=name')
    expect(expected).toEqual(res.body);
  })

  test("should sort with ascending when sortOrder is missing but sortKey is present", async () => {
    const expected = [{ id: 2, name: 'lettuce' }, { id: 1, name: 'tomato' }];

    const res = await request.get('/products?sortKey=name')
    expect(expected).toEqual(res.body);
  })

  test("should sort not respect sortOrder when sortOrder value is NOT ASC or DESC", async () => {
    const expected = [{ id: 1, name: 'tomato' }, { id: 2, name: 'lettuce' }];

    const res = await request.get('/products?sortOrder=abc&sortKey=name')
    expect(expected).toEqual(res.body);
  })

  test("should respond with 400 when sortKey is not a valid column", async () => {
    const expected = [{ id: 1, name: 'tomato' }, { id: 2, name: 'lettuce' }];

    const res = await request.get('/products?sortOrder=abc&sortKey=notValidKey')

    expect(res.status).toBe(400)
    expect(res.text).toBe('notValidKey is not a valid sort key')
  })

  test("should filter by query parameters", async() => {
    const firstItem = { id: 1, name: "tomato" };
    const secondItem = { id: 2, name: "lettuce" };

    let res = await request.get("/products?page=1&pageSize=1");
    let [ item ] = res.body;
    expect(res.body).toHaveLength(1);
    expect(item).toEqual(firstItem);

    res = await request.get("/products/?page=2&pageSize=1");
    item = res.body[0];
    expect(res.body).toHaveLength(1);
    expect(item).toEqual(secondItem);
  });

  test("should NOT respect filter when query param missing", async() => {
    const res = await request.get("/products?page=1");
    expect(res.body).toHaveLength(2);
  });

  test("should NOT respect filter when query param has wrong value type", async () => {
    const res = await request.get("/products?page=1&pageSize=abc");
    expect(res.body).toHaveLength(2);
  });

  test("should return intro text on default route", async() => {
    const res = await request.get("/info");
    expect(res.text).toMatch(/Welcome to YAML Server/);
  });

  test("should return a product", async(done) => {
    const product = { id: 1, name: "tomato" };
    const res = await request.get("/products/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(product);
    done();
  });

  test("should return 404 resource not found", async (done) => {
    const res = await request.get("/products/3");
    expect(res.status).toBe(404);
    done();
  });

  test("should add product to /products", async(done) => {
    const createdRecord = { id: 3, name: "cucumber" };

    const res = await request
      .post("/products")
      .send({ name : "cucumber" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdRecord);
    done();
  });

  test("should update product", async(done) => {
    const changeTo = { id : 3, name: "gurkin" };
    let res = await request
      .put("/products")
      .send({ id: 3, name: "gurkin" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(changeTo);

    res = await request.get("/products/3");
    expect(changeTo).toEqual(res.body);
    done();
  });

  test("should return 404 and error message when trying to update non existing item", async() => {
    const nonExistingItem = { id: 99, name: "unknown" };
    let res = await request
      .put("/products")
      .send(nonExistingItem);
    expect(res.status).toBe(404);
    expect(res.text).toBe("Item not found with ID" + nonExistingItem.id);
  });

  test("should delete product", async(done) => {
    const deletedItem = { id: 3, name: "gurkin" };
    let res = await request.delete("/products/3");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(deletedItem);

    res = await request.get("/products/3");
    expect(res.status).toBe(404);
    done();
  });

  test("should respect existing schema on POST", async() => {
    let res = await request
      .post("/products")
      .send({ title: "should not work" });
    
    expect(res.status).toBe(400);
  });

  test("should create a new resource based on a /<resource>/new/ call", async() => {
    const kitten = { id: 1, title: "paw paw" };
    let res = await request
      .post("/kittens/new")
      .send({ title: "paw paw" });

    expect(res.status).toBe(201);  
    expect(res.body).toEqual(kitten);

    res = await request.get("/kittens");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(kitten);
  });

  test("should NOT create a new resource /<resource>/new/ call when resource already exist", async() => {
    let res = await request
      .post("/kittens/new")
      .send({ title: "paw paw" });

    expect(res.status).toBe(400);
    expect(res.text).toBe("/kittens already exist");
  });
});