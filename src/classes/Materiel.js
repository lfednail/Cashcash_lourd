/**
 * Classe représentant un matériel vendu au client.
 */
class Materiel {
  /**
   * @param {string} numeroSerie 
   * @param {string} dateVente 
   * @param {string} dateInstallation
   * @param {number} prixVente 
   * @param {string} emplacement 
   * @param {TypeMateriel} leType 
   */
  constructor(numeroSerie, dateVente, dateInstallation, prixVente, emplacement, leType) {
    this.numeroSerie = numeroSerie;
    this.dateVente = dateVente;
    this.dateInstallation = dateInstallation;
    this.prixVente = prixVente;
    this.emplacement = emplacement;
    this.leType = leType;
  }

  /**
   * Retourne la chaîne correspondant au code XML représentant le matériel.
   * @param {number} [nbJoursRestants] - Optionnel: Nombre de jours avant échéance du contrat.
   * @returns {string} Fragment XML.
   */
  genererXmlMateriel(nbJoursRestants = null) {
    const type = this.leType;
    const famille = type.laFamille;
    
    // Formatage des dates pour l'XML (JJ-MM-AA)
    const fmtDate = (d) => {
      if (!d) return '';
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yy = String(date.getFullYear()).slice(-2);
      return `${dd}-${mm}-${yy}`;
    };

    let xml = `    <materiel numSerie="${this.numeroSerie}">\n`;
    xml += `      <type refInterne="${type.referenceInterne}" libelle="${type.libelleTypeMateriel}" />\n`;
    xml += `      <famille codeFamille="${famille.codeFamille}" libelle="${famille.libelleFamille}" />\n`;
    xml += `      <date_vente>${fmtDate(this.dateVente)}</date_vente>\n`;
    xml += `      <date_installation>${fmtDate(this.dateInstallation)}</date_installation>\n`;
    xml += `      <prix_vente>${this.prixVente}</prix_vente>\n`;
    xml += `      <emplacement>${this.emplacement}</emplacement>\n`;
    if (nbJoursRestants !== null) {
      xml += `      <nbJourAvantEcheance>${nbJoursRestants}</nbJourAvantEcheance>\n`;
    }
    xml += `    </materiel>`;
    return xml;
  }
}

module.exports = Materiel;
