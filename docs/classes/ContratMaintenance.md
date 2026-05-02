# Class ContratMaintenance
Classe représentant un contrat de maintenance pour un client.

## Constructor Summary
| Constructor | Description |
|---|---|
| `ContratMaintenance(numContrat, dateSignature, dateEcheance)` | Crée une instance de ContratMaintenance. |

## Method Summary
| Modifier and Type | Method | Description |
|---|---|---|
| `number` | `getJoursRestants()` | Renvoie le nombre de jours avant l'échéance. |
| `boolean` | `estValide()` | Indique si le contrat est valide à la date du jour. |
| `void` | `ajouteMateriel(unMateriel)` | Ajoute un matériel si la date de signature est antérieure à l'installation. |

## Constructor Detail
### ContratMaintenance
```javascript
constructor(numContrat, dateSignature, dateEcheance)
```
**Parameters:**
- `numContrat` (string) - Numéro du contrat.
- `dateSignature` (string) - Date de signature.
- `dateEcheance` (string) - Date d'échéance.

## Method Detail
### getJoursRestants
```javascript
getJoursRestants()
```
Renvoie le nombre de jours avant que le contrat arrive à échéance.
**Returns:** `number` - Jours restants (0 si échu).

### estValide
```javascript
estValide()
```
Indique si le contrat est valide.
**Returns:** `boolean`

### ajouteMateriel
```javascript
ajouteMateriel(unMateriel)
```
Ajoute un matériel à la collection des matériels assurés.
**Parameters:**
- `unMateriel` (`Materiel`) - Le matériel à ajouter.
