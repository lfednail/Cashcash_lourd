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
    this.donnees = lesDonnees;
  }

  /**
   * Retourne l'objet Client chargé depuis la base avec ses liens.
   * @param {number} idClient 
   * @returns {Promise<Client|null>}
   */
  async getClient(idClient) {
    // 1. Charger les données de base du client
    const clientData = await this.donnees.chargerDepuisBase(idClient, 'Client');
    if (!clientData) return null;

    const client = new Client(
      clientData.NumeroClient,
      clientData.RaisonSociale,
      clientData.Siren,
      clientData.CodeApe,
      clientData.Adresse,
      clientData.TelephoneClient,
      clientData.Email,
      clientData.DureeDeplacement,
      clientData.DistanceKM
    );

    // 2. Charger les contrats du client (simplifié à un seul pour AP2)
    const [contratData] = await this.donnees.pool.query(
      'SELECT * FROM contratmaintenance WHERE numeroClient = ? ORDER BY dateEcheance DESC LIMIT 1',
      [idClient]
    );
    if (contratData.length > 0) {
      const c = contratData[0];
      client.leContrat = new ContratMaintenance(c.NumeroContrat, c.DateSignature, c.DateEcheance);
    }

    // 3. Charger les matériels et les lier au contrat si applicable
    const [materielsRows] = await this.donnees.pool.query(`
      SELECT m.*, tm.LibelleTypeMateriel, tm.ReferenceInterne, f.CodeFamille, f.LibelleFamille
      FROM Materiel m
      JOIN TypeMateriel tm ON m.ReferenceInterneTypeMateriel = tm.ReferenceInterne
      JOIN Famille f ON tm.CodeFamille = f.CodeFamille
      WHERE m.NumeroClient = ?
    `, [idClient]);

    for (const row of materielsRows) {
      const famille = new Famille(row.CodeFamille, row.LibelleFamille);
      const type = new TypeMateriel(row.ReferenceInterne, row.LibelleTypeMateriel, famille);
      const mat = new Materiel(row.NumeroSerie, row.DateVente, row.DateInstallation, row.PrixVente, row.Emplacement, type);
      
      client.lesMateriels.push(mat);
      
      // Si le matériel est lié à ce contrat spécifique dans la base
      if (client.leContrat && row.NumeroContrat === client.leContrat.numeroContrat) {
        client.leContrat.ajouteMateriel(mat);
      }
    }

    return client;
  }

  /**
   * Retourne une chaîne XML représentant la liste des matériels du client.
   * @param {Client} unClient 
   * @returns {string} Document XML complet.
   */
  genererXmlClient(unClient) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<listeMateriel>\n`;
    xml += `  <materiels idClient="${unClient.numeroClient}">\n`;
    
    // Matériels sous contrat
    const sousContrat = unClient.getMaterielsSousContrat();
    const nbJours = unClient.leContrat ? unClient.leContrat.getJoursRestants() : null;
    
    xml += `    <sousContrat>\n`;
    for (const mat of sousContrat) {
      xml += mat.genererXmlMateriel(nbJours).split('\n').map(l => '  ' + l).join('\n') + '\n';
    }
    xml += `    </sousContrat>\n`;

    // Matériels hors contrat
    const tous = unClient.getMateriels();
    const horsContrat = tous.filter(m => !sousContrat.includes(m));
    
    xml += `    <horsContrat>\n`;
    for (const mat of horsContrat) {
      xml += mat.genererXmlMateriel().split('\n').map(l => '  ' + l).join('\n') + '\n';
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
  static estXmlClientValide(xml) {
    // Validation de structure simple comme demandé par l'utilisateur
    if (!xml) return false;
    const hasRoot = xml.includes('<listeMateriel>') && xml.includes('</listeMateriel>');
    const hasMateriels = xml.includes('<materiels idClient=') && xml.includes('</materiels>');
    return hasRoot && hasMateriels;
  }
}

module.exports = GestionMateriels;
