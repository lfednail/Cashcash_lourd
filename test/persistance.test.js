const PersistanceSQL = require('../src/classes/PersistanceSQL');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn(() => ({
      query: jest.fn().mockResolvedValue([[{ numeroClient: 'C1', raisonSociale: 'Test' }]]),
      release: jest.fn()
    })),
    end: jest.fn()
  }))
}));

describe('Classe PersistanceSQL', () => {
  let persistance;

  beforeEach(() => {
    persistance = new PersistanceSQL('localhost', 3306, 'db', 'user', 'pass');
  });

  test('doit créer un pool avec la configuration correcte', () => {
    expect(mysql.createPool).toHaveBeenCalledWith(expect.objectContaining({
      host: 'localhost',
      database: 'db'
    }));
  });

  test('chargerDepuisBase doit appeler la requête correcte pour Client', async () => {
    const data = await persistance.chargerDepuisBase('C1', 'Client');
    expect(data.numeroClient).toBe('C1');
  });

  test('close doit fermer le pool', async () => {
    await persistance.close();
    expect(persistance.pool.end).toHaveBeenCalled();
  });
});
