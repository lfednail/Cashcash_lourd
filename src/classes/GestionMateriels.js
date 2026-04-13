const PersistanceSQL = require('./PersistanceSQL');
const Client = require('./Client');
const Materiel = require('./Materiel');
const TypeMateriel = require('./TypeMateriel');
const Famille = require('./Famille');
const ContratMaintenance = require('./ContratMaintenance');

/**
 * Classe de service orchestrant la gestion des clients et de leurs matériels.
 */
class GestionMateriels {
  /**
   * @param {PersistanceSQL} lesDonnees - Instance de persistance à utiliser.
   */
  constructor(lesDonnees) {
    this._donnees = lesDonnees;
  }

  /**
   * Retourne l'objet Client chargé depuis la base avec ses liens.
   * @param {number} idClient 
   * @returns {Promise<Client|null>}
   */
  async getClient(idClient) {
    // 1. Charger les données de base du client
    const clientData = await this._donnees.chargerDepuisBase(idClient, 'Client');
    if (!clientData) return null;

    const client = new Client(
      clientData.numeroClient,
      clientData.raisonSociale,
      clientData.siren,
      clientData.codeApe,
      clientData.adresse,
      clientData.telephoneClient,
      clientData.email,
      clientData.dureeDeplacement,
      clientData.distanceKM
    );

    // 2. Charger les contrats du client (simplifié à un seul pour AP2)
    const [contratData] = await this._donnees.pool.query(
      'SELECT * FROM contratmaintenance WHERE numeroClient = ? ORDER BY dateEcheance DESC LIMIT 1',
      [idClient]
    );
    if (contratData.length > 0) {
      const c = contratData[0];
      client._leContrat = new ContratMaintenance(c.numeroContrat, c.dateSignature, c.dateEcheance);
    }

    // 3. Charger les matériels et les lier au contrat si applicable
    const [materielsRows] = await this._donnees.pool.query(`
      SELECT m.*, tm.libelleTypeMateriel, tm.referenceInterne, f.CodeFamille, f.LibelleFamille
      FROM materiel m
      JOIN typemateriel tm ON m.referenceInterneTypeMateriel = tm.referenceInterne
      JOIN famille f ON tm.CodeFamille = f.CodeFamille
      WHERE m.numeroClient = ?
    `, [idClient]);

    for (const row of materielsRows) {
      const famille = new Famille(row.CodeFamille, row.LibelleFamille);
      const type = new TypeMateriel(row.referenceInterne, row.libelleTypeMateriel, famille);
      const mat = new Materiel(row.numeroSerie, row.dateVente, row.dateInstallation, row.prixVente, row.emplacement, type);
      
      client._lesMateriels.push(mat);
      
      // Si le matériel est lié à ce contrat spécifique dans la base
      if (client._leContrat && row.numeroContrat === client._leContrat._numContrat) {
        client._leContrat.ajouteMateriel(mat);
      }
    }

    return client;
  }

  /**
   * Retourne une chaîne XML représentant la liste des matériels du client.
   * @param {Client} unClient 
   * @returns {string} Document XML complet.
   */
  XmlClient(unClient) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<listeMateriel>\n`;
    xml += `  <materiels idClient="${unClient._numClient}">\n`;
    
    // Matériels sous contrat
    const sousContrat = unClient.getMaterielsSousContrat();
    const nbJours = unClient._leContrat ? unClient._leContrat.getJoursRestants() : null;
    
    xml += `    <sousContrat>\n`;
    for (const mat of sousContrat) {
      xml += mat.xmlMateriel(nbJours).split('\n').map(l => '  ' + l).join('\n') + '\n';
    }
    xml += `    </sousContrat>\n`;

    // Matériels hors contrat
    const tous = unClient.getMateriels();
    const horsContrat = tous.filter(m => !sousContrat.includes(m));
    
    xml += `    <horsContrat>\n`;
    for (const mat of horsContrat) {
      xml += mat.xmlMateriel().split('\n').map(l => '  ' + l).join('\n') + '\n';
    }
    xml += `    </horsContrat>\n`;

    xml += `  </materiels>\n`;
    xml += `</listeMateriel>`;
    return xml;
  }

  /**
   * Retourne vrai si le fichier XML respecte la structure attendue.
   * @param {string} xml 
   * @returns {boolean}
   */
  static XmlClientValide(xml) {
    // Validation de structure simple comme demandé par l'utilisateur
    if (!xml) return false;
    const hasRoot = xml.includes('<listeMateriel>') && xml.includes('</listeMateriel>');
    const hasMateriels = xml.includes('<materiels idClient=') && xml.includes('</materiels>');
    return hasRoot && hasMateriels;
  }
}

module.exports = GestionMateriels;
