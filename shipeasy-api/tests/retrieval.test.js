const request = require("supertest");
// const app = require("../index");
const schemas = require("../schema/schema")

require("dotenv").config();
const mongo = require('../service/mongooseConnection');

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;

var authToken;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('../router/route'));

app.get('/api/status', (req, res) => {
  res.json({ status: 'API is up and running' });
});
http.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server is listening on port ${PORT}`);
  
}).on('error', (err) => {
  console.log(`[${new Date().toISOString()}] Server error: ${err}`);
});

beforeAll(async () => {
  await mongo.connectToDatabase();
});

describe(`POST /api/user/login`, () => {
  it(`getting token`, async () => {
    const res = await request(app).post(`/api/user/login`).send({
      Username : process.env.TEST_USERNAME || "testuser",
      Password : process.env.TEST_PASSWORD || "testpassword"
      })
    expect(res.statusCode).toBe(200);
    authToken = res.body.accessToken;
    expect(res.body.accessToken.length).toBeGreaterThan(0);
  });
});

for (const cname in schemas){
  var insertedId;

  if (cname === "auditlog")
    continue;

  describe(`POST /api/${cname}`, () => {
    it(`should return ${cname}'s inserted data`, async () => {
      const res = await request(app).post(`/api/${cname}`).set('Authorization', `Bearer ${authToken}`).send(generatePayload(schemas[cname]));
      expect(res.statusCode).toBe(200);
      insertedId = res.body[`${cname}Id`]
    });
  });
  describe(`POST /api/search/${cname}/${insertedId}`, () => {
    it(`should search record from ${cname}`, async () => {
      const res = await request(app).post(`/api/search/${cname}/${insertedId}`).set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.documents.length).toBeGreaterThan(0);
    });
  });
  describe(`DELETE /api/${cname}/${insertedId}`, () => {
    it(`should delete inserted record from ${cname}`, async () => {
      const res = await request(app).delete(`/api/${cname}/${insertedId}`).set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  // let batchInsertedId = []
  // describe(`POST /api/${cname}/batchinsert`, () => {
  //   it(`should return ${cname}'s batch-inserted data`, async () => {
  //     const res = await request(app).post(`/api/${cname}/batchinsert`).set('Authorization', `Bearer ${authToken}`).send([generatePayload(schemas[cname]), generatePayload(schemas[cname])]);
  //     expect(res.statusCode).toBe(200);

  //     for (let i = 0; i < res.body.length; i++){
  //       batchInsertedId.push(res.body[i][`${cname}Id`])
  //     }
  //   });
  // });
  // for (let i = 0; i < batchInsertedId.length; i++) {
  //   describe(`DELETE /api/${cname}/${batchInsertedId[i]}`, () => {
  //     it(`should delete inserted record from ${cname}`, async () => {
  //       const res = await request(app).delete(`/api/${cname}/${batchInsertedId[i]}`).set('Authorization', `Bearer ${authToken}`);
  //       expect(res.statusCode).toBe(200);
  //     });
  //   });
  // }
}

afterAll(async () => {
  await mongo.disconnectFromDatabase();
  http.close();
});

function generatePayload(selectedSchema){
  var data;

  if (Array.isArray(selectedSchema))
      data = []
  else
      data = {}

  Object.keys(selectedSchema).forEach((key) => {
      if (key.includes("Email"))
        data[key] = "mayur@yopmail.com";
      else if (selectedSchema[key] && selectedSchema[key].type === String)
          data[key] = "THIS IS TEST STRING"
      else if (selectedSchema[key] && selectedSchema[key].type === Number)
          data[key] = 123
      else if (selectedSchema[key] && selectedSchema[key].type === Date)
          data[key] = "2024-01-19T08:58:33.696Z"
      else if (selectedSchema[key] && selectedSchema[key].type === Boolean)
          data[key] = true
      else if (selectedSchema[key] && selectedSchema[key].type === undefined){
          data[key] = generatePayload(selectedSchema[key])
      }
  });

  return data
}