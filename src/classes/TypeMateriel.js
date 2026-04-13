/**
 * Classe représentant un type de matériel.
 */
class TypeMateriel {
  /**
   * @param {string} referenceInterne 
   * @param {string} libelleTypeMateriel 
   * @param {Famille} laFamille 
   */
  constructor(referenceInterne, libelleTypeMateriel, laFamille) {
    this.referenceInterne = referenceInterne;
    this.libelleTypeMateriel = libelleTypeMateriel;
    this.laFamille = laFamille;
  }
}

module.exports = TypeMateriel;
