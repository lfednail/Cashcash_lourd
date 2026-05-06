const ContratMaintenance = require('../src/classes/ContratMaintenance');
const Materiel = require('../src/classes/Materiel');

describe('Classe ContratMaintenance', () => {
  test('estValide doit retourner vrai pour les dates actuelles', () => {
    const start = new Date();
    start.setDate(start.getDate() - 10);
    const end = new Date();
    end.setDate(end.getDate() + 10);
    
    const contrat = new ContratMaintenance('C1', start.toISOString(), end.toISOString());
    expect(contrat.estValide()).toBe(true);
  });

  test('getJoursRestants doit retourner le nombre correct de jours', () => {
    const end = new Date();
    end.setDate(end.getDate() + 5);
    const contrat = new ContratMaintenance('C1', new Date().toISOString(), end.toISOString());
    
    expect(contrat.getJoursRestants()).toBeGreaterThan(0);
    expect(contrat.getJoursRestants()).toBeLessThanOrEqual(5);
  });

  test('ajouteMateriel doit seulement ajouter si installé après la signature', () => {
    const signature = '2023-01-01';
    const contrat = new ContratMaintenance('C1', signature, '2024-01-01');
    
    const matValide = { dateInstallation: '2023-01-05' };
    const matInvalide = { dateInstallation: '2022-12-30' };
    
    contrat.ajouteMateriel(matValide);
    contrat.ajouteMateriel(matInvalide);
    
    expect(contrat.lesMaterielsAssures.length).toBe(1);
    expect(contrat.lesMaterielsAssures[0]).toBe(matValide);
  });
});
