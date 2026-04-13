/**
 * Classe représentant une famille de matériels.
 */
class Famille {
  /**
   * @param {string} codeFamille 
   * @param {string} libelleFamille 
   */
  constructor(codeFamille, libelleFamille) {
    this.codeFamille = codeFamille;
    this.libelleFamille = libelleFamille;
  }
}

module.exports = Famille;
