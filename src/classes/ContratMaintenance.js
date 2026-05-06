/**
 * Classe représentant un contrat de maintenance pour un client.
 */
class ContratMaintenance {
  /**
   * @param {string} numeroContrat 
   * @param {string} dateSignature 
   * @param {string} dateEcheance 
   */
  constructor(numeroContrat, dateSignature, dateEcheance) {
    this.numeroContrat = numeroContrat;
    this.dateSignature = new Date(dateSignature);
    this.dateEcheance = new Date(dateEcheance);
    this.lesMaterielsAssures = []; // Collection de Materiel
  }

  /**
   * Renvoie le nombre de jours avant que le contrat arrive à échéance.
   * @returns {number} Nombre de jours restants.
   */
  getJoursRestants() {
    const now = new Date();
    const diffTime = this.dateEcheance - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Indique si le contrat est valide à la date du jour.
   * @returns {boolean} Vrai si valide.
   */
  estValide() {
    const now = new Date();
    return now >= this.dateSignature && now <= this.dateEcheance;
  }

  /**
   * Ajoute un matériel à la collection si la date de signature est antérieure à l'installation.
   * @param {Materiel} unMateriel 
   */
  ajouteMateriel(unMateriel) {
    const dateInst = new Date(unMateriel.dateInstallation);
    if (this.dateSignature <= dateInst) {
      this.lesMaterielsAssures.push(unMateriel);
    }
  }
}

module.exports = ContratMaintenance;
