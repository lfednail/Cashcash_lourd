const Materiel = require('../src/classes/Materiel');
const TypeMateriel = require('../src/classes/TypeMateriel');
const Famille = require('../src/classes/Famille');

describe('Classe Materiel', () => {
  let materiel;
  let type;
  let famille;

  beforeEach(() => {
    famille = new Famille('F1', 'Informatique');
    type = new TypeMateriel('T1', 'Serveur', famille);
    materiel = new Materiel('S123', '2023-01-01', '2023-01-05', 1500, 'Salle Serveur', type);
  });

  test('doit créer une instance de matériel', () => {
    expect(materiel.numeroSerie).toBe('S123');
    expect(materiel.prixVente).toBe(1500);
  });

  test('xmlMateriel doit retourner un fragment XML valide', () => {
    const xml = materiel.genererXmlMateriel(10);
    expect(xml).toContain('<materiel numSerie="S123">');
    expect(xml).toContain('<type refInterne="T1" libelle="Serveur" />');
    expect(xml).toContain('<famille codeFamille="F1" libelle="Informatique" />');
    expect(xml).toContain('<nbJourAvantEcheance>10</nbJourAvantEcheance>');
  });

  test('xmlMateriel doit fonctionner sans nbJoursRestants', () => {
    const xml = materiel.genererXmlMateriel();
    expect(xml).not.toContain('<nbJourAvantEcheance>');
  });
});
