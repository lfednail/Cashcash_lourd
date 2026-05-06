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
    persistance = new PersistanceSQL('mysql', 'localhost', 3306, 'db', 'user', 'pass');
  });

  test('doit créer un pool avec la configuration correcte', () => {
    expect(mysql.createPool).toHaveBeenCalledWith(expect.objectContaining({
      host: 'localhost',
      database: 'db'
    }));
  });

  test('chargerDepuisBase doit appeler la requête correcte pour Client', async () => {
    // Mock the query method on the pool directly as per refactored PersistanceSQL
    persistance.pool.query = jest.fn().mockResolvedValue([[{ NumeroClient: 'C1', RaisonSociale: 'Test' }]]);
    const data = await persistance.chargerDepuisBase('C1', 'Client');
    expect(data.NumeroClient).toBe('C1');
  });

  test('fermer doit fermer le pool', async () => {
    await persistance.fermer();
    expect(persistance.pool.end).toHaveBeenCalled();
  });
});
