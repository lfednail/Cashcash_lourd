/**
 * Classe représentant un contrat de maintenance pour un client.
 */
class ContratMaintenance {
  /**
   * @param {string} numContrat 
   * @param {string} dateSignature 
   * @param {string} dateEcheance 
   */
  constructor(numContrat, dateSignature, dateEcheance) {
    this._numContrat = numContrat;
    this._dateSignature = new Date(dateSignature);
    this._dateEcheance = new Date(dateEcheance);
    this._lesMaterielsAssures = []; // Collection de Materiel
  }

  /**
   * Renvoie le nombre de jours avant que le contrat arrive à échéance.
   * @returns {number} Nombre de jours restants.
   */
  getJoursRestants() {
    const now = new Date();
    const diffTime = this._dateEcheance - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Indique si le contrat est valide à la date du jour.
   * @returns {boolean} Vrai si valide.
   */
  estValide() {
    const now = new Date();
    return now >= this._dateSignature && now <= this._dateEcheance;
  }

  /**
   * Ajoute un matériel à la collection si la date de signature est antérieure à l'installation.
   * @param {Materiel} unMateriel 
   */
  ajouteMateriel(unMateriel) {
    const dateInst = new Date(unMateriel._dateInstallation);
    if (this._dateSignature <= dateInst) {
      this._lesMaterielsAssures.push(unMateriel);
    }
  }
}

module.exports = ContratMaintenance;
