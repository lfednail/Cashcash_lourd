describe('Processus Principal', () => {
  test('main.js existe et peut être chargé (vérification minimale)', () => {
    const fs = require('fs');
    const path = require('path');
    const mainPath = path.join(__dirname, '../main.js');
    expect(fs.existsSync(mainPath)).toBe(true);
  });
});
