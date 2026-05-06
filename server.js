require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const { jsPDF } = require('jspdf');

// Classes Jalon 3
const PersistanceSQL = require('./src/classes/PersistanceSQL');
const GestionMateriels = require('./src/classes/GestionMateriels');

const app = express();
const PORT = process.env.API_PORT || 8765;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_TYPE = process.env.DB_TYPE || 'mysql';

// ─── Database Connection ──────────────────────────────────────────────────────
let pool;
if (DB_TYPE === 'postgres') {
  const { Pool } = require('pg');
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cashcash_final_app',
    port: process.env.DB_PORT || 5432,
  });
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cashcash_final_app',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

/**
 * Wrapper de requête universel (MySQL / Postgres)
 */
async function dbQuery(sql, params = []) {
  if (DB_TYPE === 'postgres') {
    let i = 1;
    const pgSql = sql.replace(/\?/g, () => `$${i++}`);
    const res = await pool.query(pgSql, params);
    return [res.rows, null];
  } else {
    return await pool.query(sql, params);
  }
}

// Initialisation Service Jalon 3
const persistance = new PersistanceSQL(
  DB_TYPE,
  process.env.DB_HOST || 'localhost',
  process.env.DB_PORT || (DB_TYPE === 'postgres' ? 5432 : 3306),
  process.env.DB_NAME || 'cashcash_final_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || ''
);
const gestionMateriels = new GestionMateriels(persistance);

// ─── Middleware Auth ──────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const matricule = req.headers['x-user-matricule'];
  if (!matricule) return res.status(401).json({ error: 'Non authentifié' });
  req.matricule = matricule;
  next();
};

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await dbQuery('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: e.message });
  }
});

// ─── Case normalizer (Windows MySQL helper) ──────────────────────────────────
function formatRow(row) {
  if (!row) return row;
  const newRow = { ...row };
  for (const key in row) {
    const pascal = key.charAt(0).toUpperCase() + key.slice(1);
    newRow[pascal] = row[key];
  }
  // Hardcoded exceptions because of abbreviations
  newRow.DistanceKM = row.DistanceKM || row.distanceKM || row.distanceKm;
  newRow.CodeApe = row.CodeApe || row.codeApe || row.codeape;
  newRow.TelephoneMobile = row.TelephoneMobile || row.telephoneMobile;
  newRow.NumeroIntervent = row.NumeroIntervent || row.numeroIntervent;
  newRow.DateVisite = row.DateVisite || row.dateVisite;
  newRow.HeureVisite = row.HeureVisite || row.heureVisite;
  newRow.MatriculeTechnicien = row.MatriculeTechnicien || row.matriculeTechnicien;
  newRow.NumeroClient = row.NumeroClient || row.numeroClient;
  return newRow;
}
function formatRows(rows) { return rows.map(formatRow); }


// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const [rows] = await dbQuery(
      `SELECT e.*, a.NomAgence, a.AdresseAgence, a.TelephoneAgence
       FROM Employe e
       JOIN Agence a ON e.NumeroAgence = a.NumeroAgence
       WHERE e.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = rows[0];
    // Normalize $2y$ (PHP bcrypt) to $2b$ (Node bcrypt)
    const hash = user.mot_de_passe.replace(/^\$2y\$/, '$2b$');
    const isValid = await bcrypt.compare(password, hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const unMatricule = user.matricule || user.Matricule;
    const unNumeroAgence = user.numeroAgence || user.NumeroAgence;
    const unNom = user.nomEmploye || user.NomEmploye;
    const unPrenom = user.prenomEmploye || user.PrenomEmploye;
    const uneAdresse = user.adresseAgence || user.AdresseAgence;

    // Fetch Technicien details if applicable
    let techInfo = null;
    if (user.role === 'TECHNICIEN') {
      const [techRows] = await dbQuery(
        'SELECT * FROM Technicien WHERE Matricule = ?',
        [unMatricule]
      );
      if (techRows.length > 0) techInfo = techRows[0];
    }

    res.json({
      matricule: unMatricule,
      nom: unNom,
      prenom: unPrenom,
      email: user.email,
      role: user.role,
      agenceId: unNumeroAgence,
      agenceName: user.NomAgence || user.nomAgence,
      agenceAdresse: uneAdresse,
      qualification: techInfo?.Qualification || techInfo?.qualification || null,
      telephoneMobile: techInfo?.TelephoneMobile || techInfo?.telephoneMobile || null,
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GESTIONNAIRE
// ══════════════════════════════════════════════════════════════════════════════

// Dashboard — Stats mensuelles (via procédure stockée / query inline)
app.get('/api/gestionnaire/stats', authenticate, async (req, res) => {
  try {
    const { month, year, agenceId } = req.query;
    
    // Remplacement de la procédure stockée par une simple requête (plus robuste si la DB est incomplète)
    const sql = `
      SELECT 
        COUNT(DISTINCT i.NumeroIntervent) AS total_interventions,
        COALESCE(SUM(c.DistanceKM * 2), 0) AS distance_parcourue_km,
        COALESCE(SUM(ct.TempsPasse), 0) AS temps_total_minutes
      FROM Intervention i
      JOIN Client c ON i.NumeroClient = c.NumeroClient
      LEFT JOIN Controler ct ON i.NumeroIntervent = ct.NumeroIntervent
      WHERE c.NumeroAgence = ? 
        AND MONTH(i.DateVisite) = ? 
        AND YEAR(i.DateVisite) = ?
    `;
    
    const [result] = await dbQuery(sql, [
      parseInt(agenceId),
      parseInt(month),
      parseInt(year),
    ]);
    res.json(result[0] || { total_interventions: 0, distance_parcourue_km: 0, temps_total_minutes: 0 });
  } catch (error) {
    console.error('[Stats Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Clients de l'agence
app.get('/api/gestionnaire/clients', authenticate, async (req, res) => {
  try {
    const { agenceId } = req.query;
    const [clients] = await dbQuery(
      `SELECT c.*,
         COUNT(DISTINCT cm.NumeroContrat) AS nb_contrats,
         COUNT(DISTINCT m.NumeroSerie)    AS nb_materiels,
         MAX(cm.DateEcheance)              AS prochaine_echeance
       FROM Client c
       LEFT JOIN ContratMaintenance cm ON c.NumeroClient = cm.NumeroClient
       LEFT JOIN Materiel m            ON c.NumeroClient = m.NumeroClient
       WHERE c.NumeroAgence = ?
       GROUP BY c.NumeroClient
       ORDER BY c.RaisonSociale`,
      [agenceId]
    );
    res.json(formatRows(clients));
  } catch (error) {
    console.error('[Clients Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Techniciens de l'agence
app.get('/api/gestionnaire/techniciens', authenticate, async (req, res) => {
  try {
    const { agenceId } = req.query;
    const [techniciens] = await dbQuery(
      `SELECT e.Matricule, e.NomEmploye, e.PrenomEmploye, e.AdresseEmploye, e.DateEmbauche,
              t.TelephoneMobile, t.Qualification, t.DateObtention,
              COUNT(DISTINCT i.NumeroIntervent) AS nb_interventions
       FROM Employe e
       JOIN Technicien t ON e.Matricule = t.Matricule
       LEFT JOIN Intervention i ON e.Matricule = i.MatriculeTechnicien
       WHERE e.NumeroAgence = ?
       GROUP BY e.Matricule
       ORDER BY e.NomEmploye`,
      [agenceId]
    );
    res.json(formatRows(techniciens));
  } catch (error) {
    console.error('[Techniciens Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Techniciens disponibles pour un client (même agence)
app.get('/api/gestionnaire/techniciens-for-client', authenticate, async (req, res) => {
  try {
    const { clientId } = req.query;
    const [techniciens] = await dbQuery(
      `SELECT e.Matricule, e.NomEmploye, e.PrenomEmploye, t.Qualification
       FROM Employe e
       JOIN Technicien t ON e.Matricule = t.Matricule
       WHERE e.NumeroAgence = (SELECT NumeroAgence FROM Client WHERE NumeroClient = ?)
       ORDER BY e.NomEmploye`,
      [clientId]
    );
    res.json(formatRows(techniciens));
  } catch (error) {
    console.error('[Tech for client Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Toutes les interventions de l'agence
app.get('/api/gestionnaire/interventions', authenticate, async (req, res) => {
  try {
    const { agenceId } = req.query;
    const [interventions] = await dbQuery(
      `SELECT i.*,
              CONCAT(e.PrenomEmploye, ' ', e.NomEmploye) AS technicienNom,
              c.RaisonSociale                              AS clientNom,
              c.Adresse                                    AS clientAdresse,
              COUNT(ct.NumeroSerieMateriel)                AS nb_controles
       FROM Intervention i
       JOIN Employe e ON i.MatriculeTechnicien = e.Matricule
       JOIN Client c  ON i.NumeroClient = c.NumeroClient
       LEFT JOIN Controler ct ON i.NumeroIntervent = ct.NumeroIntervent
       WHERE c.NumeroAgence = ?
       GROUP BY i.NumeroIntervent
       ORDER BY i.DateVisite DESC, i.HeureVisite DESC
       LIMIT 100`,
      [agenceId]
    );
    res.json(formatRows(interventions));
  } catch (error) {
    console.error('[Interventions Gest Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Créer / Assigner une intervention
app.post('/api/gestionnaire/interventions', authenticate, async (req, res) => {
  try {
    const { MatriculeTechnicien, NumeroClient, DateVisite, HeureVisite } = req.body;
    if (!MatriculeTechnicien || !NumeroClient || !DateVisite || !HeureVisite) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }
    const [result] = await dbQuery(
      'INSERT INTO Intervention (DateVisite, HeureVisite, MatriculeTechnicien, NumeroClient) VALUES (?, ?, ?, ?)',
      [DateVisite, HeureVisite, MatriculeTechnicien, NumeroClient]
    );
    res.json({ success: true, id: result.insertId, message: 'Intervention assignée avec succès' });
  } catch (error) {
    console.error('[Assign Error]', error);
    const msg = error.sqlMessage || error.message || 'Erreur serveur';
    res.status(400).json({ error: msg });
  }
});

// Détail d'un client (contrats + matériels)
app.get('/api/gestionnaire/client/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [client] = await dbQuery('SELECT * FROM Client WHERE NumeroClient = ?', [id]);
    const [contrats] = await dbQuery(
      `SELECT cm.*, tc.DelaiIntervention, tc.TauxApplicable,
              COUNT(m.NumeroSerie) AS nb_materiels
       FROM ContratMaintenance cm
       JOIN TypeContrat tc ON cm.RefTypeContrat = tc.RefTypeContrat
       LEFT JOIN Materiel m ON cm.NumeroContrat = m.NumeroContrat
       WHERE cm.NumeroClient = ?
       GROUP BY cm.NumeroContrat
       ORDER BY cm.DateEcheance DESC`,
      [id]
    );
    const [materiels] = await dbQuery(
      `SELECT m.*, tm.LibelleTypeMateriel, cm.NumeroContrat, cm.DateEcheance, tc.RefTypeContrat
       FROM Materiel m
       JOIN TypeMateriel tm ON m.ReferenceInterneTypeMateriel = tm.ReferenceInterne
       LEFT JOIN ContratMaintenance cm ON m.NumeroContrat = cm.NumeroContrat
       LEFT JOIN TypeContrat tc ON cm.RefTypeContrat = tc.RefTypeContrat
       WHERE m.NumeroClient = ?`,
      [id]
    );
    res.json({ client: formatRow(client[0]), contrats: formatRows(contrats), materiels: formatRows(materiels) });
  } catch (error) {
    console.error('[Client Detail Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Génération XML (Jalon 3)
app.get('/api/gestionnaire/client/:id/xml', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await gestionMateriels.getClient(id);
    if (!client) return res.status(404).json({ error: 'Client introuvable' });

    const xml = gestionMateriels.genererXmlClient(client);
    res.json({ xml, fileName: `client_${id}_materiels.xml` });
  } catch (error) {
    console.error('[XML Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Génération PDF Relances (Jalon 3)
app.get('/api/gestionnaire/relances-pdf', authenticate, async (req, res) => {
  try {
    const { agenceId } = req.query;
    // Clients dont le contrat expire sous 60 jours
    const [rawRows] = await dbQuery(
      `SELECT c.*, cm.numeroContrat, cm.dateEcheance
       FROM client c
       JOIN contratmaintenance cm ON c.numeroClient = cm.numeroClient
       WHERE c.numeroAgence = ? 
         AND cm.dateEcheance BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 60 DAY)`,
      [agenceId]
    );

    const rows = formatRows(rawRows);

    if (rows.length === 0) {
      return res.json({ message: 'Aucun contrat arrivant à échéance sous 60 jours.' });
    }

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('CashCash - Relances de Maintenance', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Liste des contrats arrivant à échéance sous 60 jours (Agence #${agenceId})`, 20, 35);
    
    let y = 50;
    rows.forEach((row, i) => {
      const echeance = new Date(row.DateEcheance).toLocaleDateString('fr-FR');
      doc.text(`${i+1}. ${row.RaisonSociale} (N°${row.NumeroClient})`, 20, y);
      doc.text(`   Contrat N°${row.NumeroContrat} - Échéance: ${echeance}`, 20, y + 7);
      y += 20;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    res.json({ pdf: pdfBase64, fileName: `relances_agence_${agenceId}.pdf` });
  } catch (error) {
    console.error('[PDF Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TECHNICIEN
// ══════════════════════════════════════════════════════════════════════════════

// Mes interventions
app.get('/api/technicien/interventions', authenticate, async (req, res) => {
  try {
    const { matricule } = req.query;
    const [interventions] = await dbQuery(
      `SELECT i.*,
              c.RaisonSociale, c.Adresse, c.TelephoneClient, c.Email, c.DureeDeplacement, c.DistanceKM,
              COUNT(ct.NumeroSerieMateriel) AS nb_controles
       FROM Intervention i
       JOIN Client c ON i.NumeroClient = c.NumeroClient
       LEFT JOIN Controler ct ON i.NumeroIntervent = ct.NumeroIntervent
       WHERE i.MatriculeTechnicien = ?
       GROUP BY i.NumeroIntervent
       ORDER BY i.DateVisite DESC, i.HeureVisite DESC`,
      [matricule]
    );
    res.json(formatRows(interventions));
  } catch (error) {
    console.error('[Tech Interventions Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Recherche client
app.get('/api/technicien/search', authenticate, async (req, res) => {
  try {
    const { q, agenceId } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);
    const search = `%${q.trim()}%`;
    const [clients] = await dbQuery(
      `SELECT c.*, COUNT(DISTINCT cm.NumeroContrat) AS nb_contrats
       FROM Client c
       LEFT JOIN ContratMaintenance cm ON c.NumeroClient = cm.NumeroClient
       WHERE c.NumeroAgence = ? AND (c.RaisonSociale LIKE ? OR c.Siren LIKE ? OR c.Email LIKE ?)
       GROUP BY c.NumeroClient
       LIMIT 10`,
      [agenceId, search, search, search]
    );
    res.json(formatRows(clients));
  } catch (error) {
    console.error('[Search Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Détail d'une intervention + matériels à contrôler
app.get('/api/technicien/intervention/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    // Intervention info
    const [interventions] = await dbQuery(
      `SELECT i.*, c.RaisonSociale, c.Adresse, c.TelephoneClient, c.Email
       FROM Intervention i
       JOIN Client c ON i.NumeroClient = c.NumeroClient
       WHERE i.NumeroIntervent = ?`,
      [id]
    );
    if (interventions.length === 0) return res.status(404).json({ error: 'Intervention introuvable' });

    // Materials for the client, including Controler status for this intervention
    const [materiels] = await dbQuery(
      `SELECT m.*, tm.LibelleTypeMateriel,
              cm.NumeroContrat, cm.DateEcheance, tc.RefTypeContrat, tc.DelaiIntervention,
              ct.TempsPasse, ct.Commentaire,
              CASE WHEN ct.NumeroIntervent IS NOT NULL THEN 1 ELSE 0 END AS deja_controle
       FROM Materiel m
       JOIN TypeMateriel tm ON m.ReferenceInterneTypeMateriel = tm.ReferenceInterne
       LEFT JOIN ContratMaintenance cm ON m.NumeroContrat = cm.NumeroContrat
       LEFT JOIN TypeContrat tc ON cm.RefTypeContrat = tc.RefTypeContrat
       LEFT JOIN Controler ct ON (m.NumeroSerie = ct.NumeroSerieMateriel AND ct.NumeroIntervent = ?)
       WHERE m.NumeroClient = ?`,
      [id, interventions[0].NumeroClient || interventions[0].numeroClient]
    );

    res.json({ intervention: formatRow(interventions[0]), materiels: formatRows(materiels) });
  } catch (error) {
    console.error('[Intervention Detail Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// Valider (enregistrer Controler)
app.post('/api/technicien/controler', authenticate, async (req, res) => {
  try {
    const { NumeroIntervent, NumeroSerieMateriel, TempsPasse, Commentaire } = req.body;
    if (!NumeroIntervent || !NumeroSerieMateriel) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const [existing] = await dbQuery(
      'SELECT 1 FROM Controler WHERE NumeroIntervent = ? AND NumeroSerieMateriel = ?',
      [NumeroIntervent, NumeroSerieMateriel]
    );

    if (existing.length > 0) {
      await dbQuery(
        'UPDATE Controler SET TempsPasse = ?, Commentaire = ? WHERE NumeroIntervent = ? AND NumeroSerieMateriel = ?',
        [TempsPasse || 0, Commentaire || '', NumeroIntervent, NumeroSerieMateriel]
      );
    } else {
      await dbQuery(
        'INSERT INTO Controler (NumeroIntervent, NumeroSerieMateriel, TempsPasse, Commentaire) VALUES (?, ?, ?, ?)',
        [NumeroIntervent, NumeroSerieMateriel, TempsPasse || 0, Commentaire || '']
      );
    }

    res.json({ success: true, message: 'Contrôle enregistré avec succès' });
  } catch (error) {
    console.error('[Controler Error]', error);
    const msg = error.sqlMessage || error.message || 'Erreur serveur';
    res.status(400).json({ error: msg });
  }
});

// ─── Start / Stop ─────────────────────────────────────────────────────────────
let server;

function startServer() {
  return new Promise((resolve, reject) => {
    server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`[CashCash API] Running on http://127.0.0.1:${PORT}`);
      resolve();
    });
    server.on('error', reject);
  });
}

function stopServer() {
  if (server) server.close(() => console.log('[CashCash API] Server stopped'));
}

module.exports = { app, startServer, stopServer, PORT };
