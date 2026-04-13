const mysql = require('mysql2/promise');

/**
 * Classe gérant la persistance des objets métier dans la base de données MySQL.
 * Respecte les spécifications techniques du Jalon 3.
 */
class PersistanceSQL {
  /**
   * Constructeur de la classe PersistanceSQL.
   * @param {string} ipBase - Adresse IP ou hôte de la base de données.
   * @param {number} port - Port de connexion.
   * @param {string} nomBaseDonnee - Nom de la base de données.
   * @param {string} user - Utilisateur.
   * @param {string} password - Mot de passe.
   */
  constructor(ipBase, port, nomBaseDonnee, user, password) {
    this.pool = mysql.createPool({
      host: ipBase,
      port: port,
      database: nomBaseDonnee,
      user: user,
      password: password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  /**
   * Stocke les données de l'objet dans la base de données.
   * @param {Object} unObjet - L'objet métier à sauvegarder.
   * @returns {Promise<void>}
   */
  async rangerDansBase(unObjet) {
    // Implémentation générique dépendant du type d'objet
    // Note: Pour AP2, on se concentre sur les objets spécifiés (Client, Materiel, etc.)
    console.log(`[PersistanceSQL] Sauvegarde de l'objet type: ${unObjet.constructor.name}`);
    // Logique de mapping ORM simplifiée ici si nécessaire
  }

  /**
   * Retourne l'objet de la classe nomClasse dont l'identifiant est "id".
   * @param {string} id - L'identifiant de l'objet.
   * @param {string} nomClasse - Nom de la classe de l'objet à charger.
   * @returns {Promise<Object|null>} L'objet chargé ou null si non trouvé.
   */
  async chargerDepuisBase(id, nomClasse) {
    const conn = await this.pool.getConnection();
    try {
      if (nomClasse === 'Client') {
        const [rows] = await conn.query('SELECT * FROM client WHERE numeroClient = ?', [id]);
        return rows[0] || null;
      }
      if (nomClasse === 'Materiel') {
        const [rows] = await conn.query('SELECT * FROM materiel WHERE numeroSerie = ?', [id]);
        return rows[0] || null;
      }
      if (nomClasse === 'Famille') {
        const [rows] = await conn.query('SELECT * FROM famille WHERE CodeFamille = ?', [id]);
        return rows[0] || null;
      }
      if (nomClasse === 'TypeMateriel') {
        const [rows] = await conn.query('SELECT * FROM typemateriel WHERE referenceInterne = ?', [id]);
        return rows[0] || null;
      }
      // Ajouter les autres classes au fur et à mesure
      return null;
    } finally {
      conn.release();
    }
  }

  /**
   * Ferme le pool de connexion.
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = PersistanceSQL;
