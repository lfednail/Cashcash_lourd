# Class Materiel
Classe représentant un matériel vendu au client.

## Constructor Summary
| Constructor | Description |
|---|---|
| `Materiel(numSerie, dateVente, dateInstallation, prixVente, emplacement, leType)` | Crée une instance de Materiel. |

## Method Summary
| Modifier and Type | Method | Description |
|---|---|---|
| `string` | `xmlMateriel(nbJoursRestants)` | Retourne le fragment XML représentant le matériel. |

## Constructor Detail
### Materiel
```javascript
constructor(numSerie, dateVente, dateInstallation, prixVente, emplacement, leType)
```
**Parameters:**
- `numSerie` (string)
- `dateVente` (string)
- `dateInstallation` (string)
- `prixVente` (number)
- `emplacement` (string)
- `leType` (`TypeMateriel`)

## Method Detail
### xmlMateriel
```javascript
xmlMateriel(nbJoursRestants = null)
```
Génère la chaîne correspondant au code XML représentant le matériel.
**Parameters:**
- `nbJoursRestants` (`number`, optionnel) - Nombre de jours avant échéance du contrat.
**Returns:** `string` - Fragment XML.
