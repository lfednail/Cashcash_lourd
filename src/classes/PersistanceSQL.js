const mysql = require('mysql2/promise');
const { Pool } = require('pg');

/**
 * Classe gérant la persistance des objets métier.
 * Supporte désormais MySQL et PostgreSQL pour la mise en conformité VDEV.
 */
class PersistanceSQL {
  /**
   * @param {string} typeBase - 'mysql' ou 'postgres'
   * @param {string} adresseIp - Hôte
   * @param {number} port - Port
   * @param {string} nomBaseDonnees - Nom DB
   * @param {string} utilisateur - Utilisateur
   * @param {string} motDePasse - MDP
   */
  constructor(typeBase, adresseIp, port, nomBaseDonnees, utilisateur, motDePasse) {
    this.typeBase = typeBase || 'mysql';
    
    if (this.typeBase === 'postgres') {
      this.pool = new Pool({
        host: adresseIp,
        port: port,
        database: nomBaseDonnees,
        user: utilisateur,
        password: motDePasse,
      });
    } else {
      this.pool = mysql.createPool({
        host: adresseIp,
        port: port,
        database: nomBaseDonnees,
        user: utilisateur,
        password: motDePasse,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
  }

  /**
   * Exécute une requête SQL de manière agnostique au SGBD.
   * Gère la différence de syntaxe des placeholders (? vs $1).
   */
  async executeQuery(sql, params = []) {
    let finalSql = sql;
    if (this.typeBase === 'postgres') {
      // Conversion des ? en $1, $2...
      let i = 1;
      finalSql = sql.replace(/\?/g, () => `$${i++}`);
      const res = await this.pool.query(finalSql, params);
      return [res.rows, null];
    } else {
      return await this.pool.query(finalSql, params);
    }
  }

  async chargerDepuisBase(id, nomClasse) {
    const table = nomClasse.toLowerCase();
    const pk = (nomClasse === 'Client') ? 'numeroClient' : 
               (nomClasse === 'Materiel') ? 'numeroSerie' : 
               (nomClasse === 'Famille') ? 'codeFamille' : 
               (nomClasse === 'TypeMateriel') ? 'referenceInterne' : 'id';
    
    const sql = `SELECT * FROM ${table} WHERE ${pk} = ?`;
    const [rows] = await this.executeQuery(sql, [id]);
    return rows[0] || null;
  }

  async fermer() {
    if (this.typeBase === 'postgres') {
      await this.pool.end();
    } else {
      await this.pool.end();
    }
  }
}

module.exports = PersistanceSQL;
