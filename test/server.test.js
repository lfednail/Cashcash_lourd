const request = require('supertest');

// Mock mysql2 BEFORE requiring the app
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    query: jest.fn().mockResolvedValue([[]]),
    getConnection: jest.fn()
  }))
}));

const { app } = require('../server');

describe('Serveur API', () => {
  test('GET /api/health doit retourner ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/auth/login doit retourner 400 si les identifiants sont manquants', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toEqual(400);
  });

  test('GET /api/gestionnaire/clients doit nécessiter une authentification', async () => {
    const res = await request(app).get('/api/gestionnaire/clients');
    expect(res.statusCode).toEqual(401);
  });
});
