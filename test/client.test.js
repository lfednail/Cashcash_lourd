const Client = require('../src/classes/Client');
const ContratMaintenance = require('../src/classes/ContratMaintenance');

describe('Classe Client', () => {
  let client;

  beforeEach(() => {
    client = new Client(
      'C123', 'Ma Société', '123456789', 'APE123',
      '123 Rue de Test', '0102030405', 'test@test.com',
      30, 15
    );
  });

  test('doit créer une instance de client', () => {
    expect(client._numClient).toBe('C123');
    expect(client._raisonSociale).toBe('Ma Société');
    expect(client.getMateriels()).toEqual([]);
  });

  test('estAssure doit retourner faux si aucun contrat', () => {
    expect(client.estAssure()).toBe(false);
  });

  test('estAssure doit retourner vrai si le contrat est valide', () => {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    const contrat = new ContratMaintenance('CONTRAT1', today.toISOString(), nextYear.toISOString());
    client._leContrat = contrat;
    
    expect(client.estAssure()).toBe(true);
  });

  test('getMaterielsSousContrat doit retourner vide si aucun contrat', () => {
    expect(client.getMaterielsSousContrat()).toEqual([]);
  });
});
