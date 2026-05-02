const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Génération du Rapport de Test Professionnel ---');

const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// 1. Exécution des tests
try {
  execSync('npx jest --json --outputFile=test-results.json', { encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  // On ignore l'erreur pour continuer la génération du rapport
}

if (!fs.existsSync('test-results.json')) {
  console.error('Erreur: test-results.json non généré.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
const { jsPDF } = require('jspdf');

// 2. Configuration du document PDF
const doc = new jsPDF();
const COLORS = {
  PRIMARY: [26, 94, 32],      // Vert CashCash
  SECONDARY: [56, 142, 60],   // Vert Clair
  ACCENT: [200, 230, 201],    // Vert très clair (fond)
  TEXT_DARK: [33, 33, 33],
  TEXT_LIGHT: [255, 255, 255],
  SUCCESS: [46, 125, 50],
  FAIL: [198, 40, 40],
  BG_GREY: [249, 249, 249],
  BORDER_GREY: [224, 224, 224]
};

const FOOTER_TEXT = 'Rapport de Test - CashCash Jalon 3 | Confidentiel';

// --- FONCTIONS UTILS ---
const drawHeader = (pageNum) => {
  doc.setFillColor(...COLORS.PRIMARY);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  doc.setFontSize(10);
  doc.text('CASHCASH - DIRECTION TECHNIQUE', 20, 13);
  doc.text(`Page ${pageNum}`, 190, 13, { align: 'right' });
};

const drawFooter = () => {
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(FOOTER_TEXT, 105, 287, { align: 'center' });
  doc.setDrawColor(230, 230, 230);
  doc.line(20, 282, 190, 282);
};

// --- PAGE DE GARDE ---
// Sidebar décorative
doc.setFillColor(...COLORS.PRIMARY);
doc.rect(0, 0, 15, 297, 'F');
doc.setFillColor(...COLORS.SECONDARY);
doc.rect(15, 0, 2, 297, 'F');

// Logo / Titre
const logoPath = path.join(__dirname, '../public/images/cashcash-logov3.png');
if (fs.existsSync(logoPath)) {
  const logoData = fs.readFileSync(logoPath).toString('base64');
  doc.addImage(logoData, 'PNG', 35, 35, 50, 50); // Ajuster taille/pos selon besoin
}

doc.setTextColor(...COLORS.TEXT_DARK);
doc.setFontSize(26);
doc.setFont('helvetica', 'bold');
doc.text('RAPPORT DE TESTS', 35, 100);
doc.text('UNITAIRES', 35, 112);

doc.setDrawColor(...COLORS.PRIMARY);
doc.setLineWidth(1.5);
doc.line(35, 118, 90, 118);

doc.setFontSize(12);
doc.setFont('helvetica', 'normal');
doc.setTextColor(100, 100, 100);
doc.text('Projet : Client Lourd CashCash - Jalon 3', 35, 128);

// Informations de session
const infoY = 140;
doc.setDrawColor(...COLORS.PRIMARY);
doc.setLineWidth(1.5);
doc.line(35, infoY, 35, infoY + 45); 

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...COLORS.PRIMARY);
doc.text('DÉTAILS DE LA SESSION', 40, infoY + 5);

// Ligne 1: Date
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(100, 100, 100);
doc.text('DATE ET HEURE :', 40, infoY + 18);
doc.setFont('helvetica', 'normal');
doc.setTextColor(...COLORS.TEXT_DARK);
doc.text(`${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 75, infoY + 18);

// Ligne 2: Environnement
doc.setFont('helvetica', 'bold');
doc.setTextColor(100, 100, 100);
doc.text('ENVIRONNEMENT :', 40, infoY + 28);
doc.setFont('helvetica', 'normal');
doc.setTextColor(...COLORS.TEXT_DARK);
doc.text('Développement / Node.js 20.x (Windows)', 75, infoY + 28);

// Ligne 3: Version
doc.setFont('helvetica', 'bold');
doc.setTextColor(100, 100, 100);
doc.text('VERSION APP :', 40, infoY + 38);
doc.setFont('helvetica', 'normal');
doc.setTextColor(...COLORS.TEXT_DARK);
doc.text('1.0.0-final (Jalon 3)', 75, infoY + 38);

// Score de réussite (Section Redessinée)
const score = Math.round((results.numPassedTests / results.numTotalTests) * 100);
const isSuccess = score === 100;
const statusColor = isSuccess ? COLORS.SUCCESS : COLORS.FAIL;

// Fond du badge de statut
doc.setFillColor(250, 250, 250);
doc.roundedRect(35, 215, 140, 45, 3, 3, 'F');
doc.setDrawColor(...COLORS.BORDER_GREY);
doc.roundedRect(35, 215, 140, 45, 3, 3, 'S');

// Indicateur de score (Cercle de progression stylisé)
doc.setLineWidth(2);
doc.setDrawColor(230, 230, 230);
doc.circle(150, 237, 15, 'S'); // Cercle de fond

doc.setDrawColor(...statusColor);
doc.setLineWidth(2.5);
// On simule une progression si < 100%, ici on dessine juste le cercle si 100%
if (isSuccess) {
  doc.circle(150, 237, 15, 'S');
} else {
  // Optionnel: dessiner un arc (complexe sans plugin), on reste sur un cercle plein de la couleur du statut
  doc.circle(150, 237, 15, 'S');
}

doc.setTextColor(...statusColor);
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.text(`${score}%`, 150, 238, { align: 'center' });
doc.setFontSize(7);
doc.text('RÉUSSITE', 150, 244, { align: 'center' });

// Texte de Statut
doc.setTextColor(...COLORS.TEXT_DARK);
doc.setFont('helvetica', 'normal');
doc.setFontSize(11);
doc.text('STATUT DE VALIDATION TECHNIQUE', 45, 230);

doc.setFontSize(18);
doc.setFont('helvetica', 'bold');
doc.setTextColor(...statusColor);
doc.text(isSuccess ? 'CONFORME' : 'NON-CONFORME', 45, 242);

doc.setFontSize(8);
doc.setFont('helvetica', 'italic');
doc.setTextColor(120, 120, 120);
doc.text('Validé par la suite de tests automatisés Jest v29.x', 45, 250);

drawFooter();

// --- PAGE 2 : RÉSUMÉ EXÉCUTIF ---
doc.addPage();
drawHeader(2);

// Bannière d'état (En-tête de section)
const isGlobalSuccess = results.numFailedTests === 0;
doc.setFillColor(...(isGlobalSuccess ? COLORS.SUCCESS : COLORS.FAIL));
doc.rect(20, 35, 170, 12, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.text(isGlobalSuccess ? 'STATUT : SYSTÈME CONFORME AUX SPÉCIFICATIONS' : 'STATUT : NON-CONFORMITÉ DÉTECTÉE', 105, 43, { align: 'center' });

doc.setFontSize(18);
doc.setTextColor(...COLORS.PRIMARY);
doc.text('1. RÉSUMÉ EXÉCUTIF', 20, 60);

doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(...COLORS.TEXT_DARK);
doc.text('Synthèse des indicateurs de performance et de qualité du code source pour le Jalon 3.', 20, 68);

// --- SECTION MÉTRIQUES (Redessiné style Dashboard Circulaire) ---
const dashY = 85;
const circleX = [55, 105, 155];

const drawCircularMetric = (x, label, value, sub, color) => {
  // Cercle de fond (Gris)
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(1.5);
  doc.circle(x, dashY + 5, 18, 'S');

  // Accent (Petit arc simulé ou cercle partiel)
  doc.setDrawColor(...color);
  doc.setLineWidth(2);
  doc.circle(x, dashY + 5, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.TEXT_DARK);
  doc.text(value.toString(), x, dashY + 7, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(label.toUpperCase(), x, dashY + 28, { align: 'center' });
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(sub, x, dashY + 32, { align: 'center' });
};

drawCircularMetric(circleX[0], 'Volume', results.numTotalTests, 'Tests exécutés', COLORS.PRIMARY);
drawCircularMetric(circleX[1], 'Succès', results.numPassedTests, 'Cas validés', COLORS.SUCCESS);
drawCircularMetric(circleX[2], 'Score', `${score}%`, 'Taux de conformité', isGlobalSuccess ? COLORS.SUCCESS : COLORS.FAIL);

// --- SYNTHÈSE DE L'AUDIT (Redessiné style Certificat Premium) ---
const certY = 140;
doc.setFillColor(252, 252, 252);
doc.rect(20, certY, 170, 48, 'F');
doc.setDrawColor(...COLORS.BORDER_GREY);
doc.setLineWidth(0.2);
doc.rect(20, certY, 170, 48, 'S');

// Barre de statut supérieure
doc.setFillColor(...(isGlobalSuccess ? COLORS.SUCCESS : COLORS.FAIL));
doc.rect(20, certY, 170, 2, 'F');

// Grade et Libellé
doc.setTextColor(...(isGlobalSuccess ? COLORS.SUCCESS : COLORS.FAIL));
doc.setFontSize(28);
doc.setFont('helvetica', 'bold');
doc.text(isGlobalSuccess ? 'PASS' : 'FAIL', 30, certY + 22);

doc.setFontSize(10);
doc.setTextColor(...COLORS.TEXT_DARK);
doc.text('SYNTHÈSE QUALITÉ LOGICIELLE', 30, certY + 32);

doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.setTextColor(80, 80, 80);
const conclusionText = isGlobalSuccess 
  ? "L'intégralité de la suite de tests unitaires a été validée avec succès. Aucun point de blocage n'a été identifié. La solution est jugée apte au déploiement."
  : "Des échecs critiques ont été détectés lors de la phase de validation. La solution ne répond pas aux critères de qualité requis pour le Jalon 3.";

const wrappedConclusion = doc.splitTextToSize(conclusionText, 130);
doc.text(wrappedConclusion, 30, certY + 40);

// Petit indicateur de temps en bas du bloc
doc.setFontSize(7);
doc.setTextColor(150, 150, 150);
doc.text(`Temps d'exécution : ${((Date.now() - results.startTime) / 1000).toFixed(2)}s`, 188, certY + 45, { align: 'right' });

// Bloc d'Approbation avec Sceau
const signY = 190;
doc.setDrawColor(...COLORS.PRIMARY);
doc.setLineWidth(0.5);
doc.line(20, signY, 190, signY);

doc.setFontSize(12);
doc.setTextColor(...COLORS.PRIMARY);
doc.text('Certification et Approbation', 25, signY + 12);

// Simulation de sceau
doc.setDrawColor(...COLORS.PRIMARY);
doc.setLineWidth(0.8);
doc.circle(165, signY + 25, 12, 'S');
doc.setFontSize(6);
doc.text('VALIDÉ', 165, signY + 24, { align: 'center' });
doc.text('CASHCASH', 165, signY + 27, { align: 'center' });

doc.setFontSize(9);
doc.setTextColor(...COLORS.TEXT_DARK);
doc.setFont('helvetica', 'normal');
doc.text('Approuvé électroniquement par la direction technique.', 25, signY + 22);
doc.text('Signature du Responsable QA :', 25, signY + 35);
doc.setFont('helvetica', 'bold');
doc.text('Equipe DevOps CashCash', 25, signY + 42);

drawFooter();

// --- PAGE 3+ : DÉTAILS TECHNIQUES ---
doc.addPage();
let pNum = 3;
drawHeader(pNum);

doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.setTextColor(...COLORS.PRIMARY);
doc.text('2. DÉTAILS DES TESTS PAR COMPOSANT', 20, 40);

let currentY = 55;

results.testResults.forEach((suite, idx) => {
  const fileName = path.basename(suite.name);
  const suiteTotal = suite.assertionResults.length;
  const suitePassed = suite.assertionResults.filter(r => r.status === 'passed').length;
  const suiteOk = suite.status === 'passed';

  if (currentY > 220) {
    drawFooter();
    doc.addPage();
    pNum++;
    drawHeader(pNum);
    currentY = 35;
  }

  // En-tête de Suite (Barre de titre)
  doc.setFillColor(...COLORS.BG_GREY);
  doc.rect(20, currentY, 170, 10, 'F');
  doc.setDrawColor(...COLORS.BORDER_GREY);
  doc.line(20, currentY, 190, currentY);
  doc.line(20, currentY + 10, 190, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.PRIMARY);
  doc.text(`COMPOSANT : ${fileName.toUpperCase()}`, 25, currentY + 7);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`${suitePassed}/${suiteTotal} tests validés`, 190, currentY + 7, { align: 'right' });

  currentY += 10;

  // Header du tableau
  doc.setFillColor(252, 252, 252);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('CAS DE TEST', 25, currentY + 7);
  doc.text('RÉSULTAT', 170, currentY + 7, { align: 'center' });
  currentY += 10;

  // Lignes de tests
  suite.assertionResults.forEach((test, tIdx) => {
    if (currentY > 270) {
      drawFooter();
      doc.addPage();
      pNum++;
      drawHeader(pNum);
      currentY = 35;
    }

    const isTestOk = test.status === 'passed';
    
    // Background alterné
    if (tIdx % 2 === 1) {
      doc.setFillColor(253, 253, 253);
      doc.rect(20, currentY, 170, 8, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.TEXT_DARK);
    doc.text(test.fullName, 25, currentY + 5.5);

    // Badge Statut
    const badgeX = 160;
    const badgeY = currentY + 2;
    doc.setFillColor(...(isTestOk ? COLORS.SUCCESS : COLORS.FAIL));
    doc.roundedRect(badgeX, badgeY, 20, 4.5, 1, 1, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(isTestOk ? 'OK' : 'ERREUR', badgeX + 10, badgeY + 3.2, { align: 'center' });

    currentY += 8;
  });

  currentY += 10; // Espace entre les composants
});

drawFooter();

// --- SAUVEGARDE ---
const pdfPath = path.join(docsDir, 'test-report.pdf');
doc.save(pdfPath);

// Mise à jour du Markdown
let reportMd = `# Rapport de Test Technique - CashCash\n\n`;
reportMd += `> Statut: **${score}% SUCCÈS**\n\n`;
reportMd += `Le rapport complet et professionnel a été généré au format PDF pour une présentation officielle.\n\n`;
reportMd += `[Télécharger le Rapport PDF (file://${pdfPath.replace(/\\/g, '/')})]\n\n`;
reportMd += `### Détails rapides :\n`;
reportMd += `- Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
reportMd += `- Tests passés: ${results.numPassedTests}/${results.numTotalTests}\n`;
fs.writeFileSync(path.join(docsDir, 'test-report.md'), reportMd);

console.log(`Rapport ultra-professionnel généré : ${pdfPath}`);

// Nettoyage
if (fs.existsSync('test-results.json')) fs.unlinkSync('test-results.json');
