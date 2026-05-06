const GestionMateriels = require('../src/classes/GestionMateriels');
const Client = require('../src/classes/Client');

describe('Classe GestionMateriels', () => {
  let gestion;
  let mockPersistance;

  beforeEach(() => {
    mockPersistance = {
      chargerDepuisBase: jest.fn(),
      pool: {
        query: jest.fn()
      }
    };
    gestion = new GestionMateriels(mockPersistance);
  });

  test('XmlClientValide doit valider la structure XML de base', () => {
    const validXml = '<listeMateriel><materiels idClient="1">...</materiels></listeMateriel>';
    const invalidXml = '<somethingElse></somethingElse>';
    
    expect(GestionMateriels.estXmlClientValide(validXml)).toBe(true);
    expect(GestionMateriels.estXmlClientValide(invalidXml)).toBe(false);
  });

  test('XmlClient doit générer un document XML complet', () => {
    const client = new Client('C1', 'Test', '123', 'APE', 'Adr', 'Tel', 'Email', 10, 5);
    const xml = gestion.genererXmlClient(client);
    
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<listeMateriel>');
    expect(xml).toContain('<materiels idClient="C1">');
  });
});
