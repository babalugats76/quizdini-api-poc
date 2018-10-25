const request = require('supertest');
const app = require('../app')
describe('User Integration Test', () => {
  test('Create user for tests', async () => {
    try {
      const response = await request(app)
        .post('/users')
        .send({
          "username": "jestified",
          "email": "test@testme.test",
          "password": "J!st12345",
          "confirmPassword": "J!st12345",
          "firstName": "Testy",
          "lastName": "McTesterson",
          "title": "Mr.",
          "city": "Testerton",
          "stateCode": "CA",
          "countryCode": "US"   
        })
        .set('Accept', /application\/json/)
        .expect(200);  
      } catch(e) {
        console.log(e); 
      }   
  });  
  test('Testing /user/:username', async () => {
    const response = await request(app).get('/users/jestified');
    expect(response.statusCode).toBe(200);
  });
})
