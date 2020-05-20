const { createServer, server, getHttpServer } = require('../server');
const path = require('path');
const fs = require('fs');
const supertest = require('supertest');
createServer(3000, path.join(__dirname, "db.yml"));

const request = supertest(server);

describe('server', () => {
  afterAll(async(done) => {
    // restore yml
    const original = fs.readFileSync(path.join(__dirname, 'original-db.yml'));
    fs.writeFileSync(path.join(__dirname, 'db.yml'), original);
    getHttpServer().close(() => {
      console.log("server closed!");
      done();
    });
  })

  test('should return products', async(done) => {
    const products = [{
      id: 1,
      name: 'tomato'
    }, {
      id: 2,
      name: 'lettuce'
    }]

    const res = await request.get('/products')
    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
    done();
  })

  test('should filter by query parameters', async() => {
    const firstItem = { id: 1, name: 'tomato' };
    const secondItem = { id: 2, name: 'lettuce' };

    let res = await request.get('/products?page=1&pageSize=1');
    let [ item ] = res.body;
    expect(res.body.length).toBe(1);
    expect(item).toEqual(firstItem);

    res = await request.get('/products/?page=2&pageSize=1');
    item = res.body[0];
    expect(res.body.length).toBe(1);
    expect(item).toEqual(secondItem);
  })

  test('should NOT respect filter when query param missing', async() => {
    const res = await request.get('/products?page=1');
    expect(res.body.length).toBe(2);
  })

  test("should NOT respect filter when query param has wrong value type", async () => {
    const res = await request.get("/products?page=1&pageSize=abc");
    expect(res.body.length).toBe(2);
  });

  test('should return intro text on default route', async() => {
    const res = await request.get('/');
    expect(res.text).toMatch(/Welcome to YAML Server/)
  })

  test('should return a product', async(done) => {
    const product = { id: 1, name: 'tomato' };
    const res = await request.get('/products/1')
    expect(res.status).toBe(200);
    expect(res.body).toEqual(product);
    done();
  })

  test("should return 404 resource not found", async (done) => {
    const res = await request.get("/products/3");
    expect(res.status).toBe(404);
    done();
  });

  test('should add product to /products', async(done) => {
    const createdRecord = { id: 3, name: 'cucumber' };

    const res = await request
      .post('/products')
      .send({ name : 'cucumber' })
    expect(res.status).toBe(201)
    expect(res.body).toEqual(createdRecord)
    done();
  })

  test('should update product', async(done) => {
    const changeTo = { id : 3, name: 'gurkin' };
    let res = await request
      .put('/products')
      .send({ id: 3, name: 'gurkin' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(changeTo);

    res = await request.get('/products/3')
    expect(changeTo).toEqual(res.body);
    done();
  })

  test('should return 404 and error message when trying to update non existing item', async() => {
    const nonExistingItem = { id: 99, name: 'unknown' };
    let res = await request
      .put('/products')
      .send(nonExistingItem)
    expect(res.status).toBe(404);
    expect(res.text).toBe("Item not found with ID" + nonExistingItem.id)
  })

  test('should delete product', async(done) => {
    const deletedItem = { id: 3, name: "gurkin" };
    let res = await request.delete('/products/3');
    expect(res.status).toBe(200)
    expect(res.body).toEqual(deletedItem)

    res = await request.get('/products/3');
    expect(res.status).toBe(404)
    done();
  })

  test('should respect existing schema on POST', async() => {
    let res = await request
      .post('/products')
      .send({ title: 'should not work' })
    
    expect(res.status).toBe(400)
  })

  test('should create a new resource based on a /<resource>/new/ call', async() => {
    const kitten = { id: 1, title: 'paw paw' };
    let res = await request
      .post('/kittens/new')
      .send({ title: 'paw paw' });

    expect(res.status).toBe(201);  
    expect(res.body).toEqual(kitten);

    res = await request.get('/kittens');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(kitten);
  })
})