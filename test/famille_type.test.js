const Famille = require('../src/classes/Famille');
const TypeMateriel = require('../src/classes/TypeMateriel');

describe('Classes Famille et TypeMateriel', () => {
  test('Famille doit stocker les propriétés correctement', () => {
    const f = new Famille('F1', 'Bureautique');
    expect(f.codeFamille).toBe('F1');
    expect(f.libelleFamille).toBe('Bureautique');
  });

  test('TypeMateriel doit stocker les propriétés et lier à la Famille', () => {
    const f = new Famille('F1', 'Bureautique');
    const t = new TypeMateriel('T1', 'Imprimante', f);
    expect(t.referenceInterne).toBe('T1');
    expect(t.libelleTypeMateriel).toBe('Imprimante');
    expect(t.laFamille).toBe(f);
  });
});
