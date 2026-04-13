/**
 * Classe représentant un client de CashCash.
 */
class Client {
  /**
   * @param {string} numClient 
   * @param {string} raisonSociale 
   * @param {string} siren 
   * @param {string} codeApe 
   * @param {string} adresse 
   * @param {string} telClient 
   * @param {string} email 
   * @param {number} dureeDeplacement 
   * @param {number} distanceKm 
   */
  constructor(numClient, raisonSociale, siren, codeApe, adresse, telClient, email, dureeDeplacement, distanceKm) {
    this._numClient = numClient;
    this._raisonSociale = raisonSociale;
    this._siren = siren;
    this._codeApe = codeApe;
    this._adresse = adresse;
    this._telClient = telClient;
    this._email = email;
    this._dureeDeplacement = dureeDeplacement;
    this._distanceKm = distanceKm;
    
    this._lesMateriels = []; // Collection de Materiel
    this._leContrat = null;  // Instance de ContratMaintenance
  }

  /**
   * Retourne l'ensemble des matériels du client.
   * @returns {Array} Collection de Materiel.
   */
  getMateriels() {
    return this._lesMateriels;
  }

  /**
   * Retourne l'ensemble des matériels pour lesquels le client a souscrit un contrat de maintenance valide.
   * @returns {Array} Collection de Materiel sous contrat.
   */
  getMaterielsSousContrat() {
    if (!this.estAssure()) return [];
    return this._leContrat._lesMaterielsAssures;
  }

  /**
   * Retourne vrai si le client est assuré (possède un contrat valide).
   * @returns {boolean}
   */
  estAssure() {
    return this._leContrat !== null && this._leContrat.estValide();
  }
}

module.exports = Client;
