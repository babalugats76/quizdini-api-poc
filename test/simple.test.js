const request = require('supertest');
const app = require('../src/app')
describe('Basic Test', () => {
  test('Get by Username', async () => {
      const response = await request(app)
        .get('/v1/users/babalugats76')
        .set('Accept', /application\/json/);
      expect(response.status).toBe(200);
      expect(response.body[0].username).toBe('babalugats76');
  });
})
