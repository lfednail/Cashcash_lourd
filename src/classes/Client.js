/**
 * Classe représentant un client de CashCash.
 */
class Client {
  /**
   * @param {string} numeroClient 
   * @param {string} raisonSociale 
   * @param {string} siren 
   * @param {string} codeApe 
   * @param {string} adresse 
   * @param {string} telephoneClient 
   * @param {string} email 
   * @param {number} dureeDeplacement 
   * @param {number} distanceKM 
   */
  constructor(numeroClient, raisonSociale, siren, codeApe, adresse, telephoneClient, email, dureeDeplacement, distanceKM) {
    this.numeroClient = numeroClient;
    this.raisonSociale = raisonSociale;
    this.siren = siren;
    this.codeApe = codeApe;
    this.adresse = adresse;
    this.telephoneClient = telephoneClient;
    this.email = email;
    this.dureeDeplacement = dureeDeplacement;
    this.distanceKM = distanceKM;
    
    this.lesMateriels = []; // Collection de Materiel
    this.leContrat = null;  // Instance de ContratMaintenance
  }

  /**
   * Retourne l'ensemble des matériels du client.
   * @returns {Array} Collection de Materiel.
   */
  getMateriels() {
    return this.lesMateriels;
  }

  /**
   * Retourne l'ensemble des matériels pour lesquels le client a souscrit un contrat de maintenance valide.
   * @returns {Array} Collection de Materiel sous contrat.
   */
  getMaterielsSousContrat() {
    if (!this.estAssure()) return [];
    return this.leContrat.lesMaterielsAssures;
  }

  /**
   * Retourne vrai si le client est assuré (possède un contrat valide).
   * @returns {boolean}
   */
  estAssure() {
    return this.leContrat !== null && this.leContrat.estValide();
  }
}

module.exports = Client;
