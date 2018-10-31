const request = require('supertest');
const app = require('../app')
describe('User Model Integration Test', () => {
  test('Duplicate User', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          "username": "babalugats76",
          "email": "james@colestock.com",
          "password": "P!ssw0rd",
          "confirmPassword": "P!ssw0rd",
          "firstName": "James",
          "lastName": "Colestock",
          "title": "Mr.",
          "city": "Wheat Ridge",
          "stateCode": "CO",
          "countryCode": "US"   
        })
        .set('Accept', /application\/json/);
      expect(response.status).toBe(409);
      expect(response.body.success).toBeFalsy();
  });  
  test('Testing /user/:username', async () => {
    expect.assertions(2);
    const response = await request(app).get('/users/babalugats76');
    expect(response.status).toBe(200);
    expect(response.body.data[0].username).toBe('babalugats76');
  });
})
