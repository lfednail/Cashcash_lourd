/**
 * Classe représentant un matériel vendu au client.
 */
class Materiel {
  /**
   * @param {string} numSerie 
   * @param {string} dateVente 
   * @param {string} dateInstallation
   * @param {number} prixVente 
   * @param {string} emplacement 
   * @param {TypeMateriel} leType 
   */
  constructor(numSerie, dateVente, dateInstallation, prixVente, emplacement, leType) {
    this._numSerie = numSerie;
    this._dateVente = dateVente;
    this._dateInstallation = dateInstallation;
    this._prixVente = prixVente;
    this._emplacement = emplacement;
    this._leType = leType;
  }

  /**
   * Retourne la chaîne correspondant au code XML représentant le matériel.
   * @param {number} [nbJoursRestants] - Optionnel: Nombre de jours avant échéance du contrat.
   * @returns {string} Fragment XML.
   */
  xmlMateriel(nbJoursRestants = null) {
    const type = this._leType;
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

    let xml = `    <materiel numSerie="${this._numSerie}">\n`;
    xml += `      <type refInterne="${type.referenceInterne}" libelle="${type.libelleTypeMateriel}" />\n`;
    xml += `      <famille codeFamille="${famille.codeFamille}" libelle="${famille.libelleFamille}" />\n`;
    xml += `      <date_vente>${fmtDate(this._dateVente)}</date_vente>\n`;
    xml += `      <date_installation>${fmtDate(this._dateInstallation)}</date_installation>\n`;
    xml += `      <prix_vente>${this._prixVente}</prix_vente>\n`;
    xml += `      <emplacement>${this._emplacement}</emplacement>\n`;
    if (nbJoursRestants !== null) {
      xml += `      <nbJourAvantEcheance>${nbJoursRestants}</nbJourAvantEcheance>\n`;
    }
    xml += `    </materiel>`;
    return xml;
  }
}

module.exports = Materiel;
