# Class PersistanceSQL
Gère la persistance des objets métier dans MySQL.

## Constructor Summary
| Constructor | Description |
|---|---|
| `PersistanceSQL(ipBase, port, nomBaseDonnee, user, password)` | Initialise le pool de connexions MySQL. |

## Method Summary
| Modifier and Type | Method | Description |
|---|---|---|
| `Promise<void>` | `rangerDansBase(unObjet)` | Stocke les données de l'objet dans la BDD. |
| `Promise<Object>` | `chargerDepuisBase(id, nomClasse)` | Retourne l'objet de la classe demandée. |
| `Promise<void>` | `close()` | Ferme le pool. |

## Method Detail
### rangerDansBase
```javascript
async rangerDansBase(unObjet)
```
**Parameters:** `unObjet` (`Object`)

### chargerDepuisBase
```javascript
async chargerDepuisBase(id, nomClasse)
```
**Parameters:** 
- `id` (`string`)
- `nomClasse` (`string`) - ex: 'Client', 'Materiel'.
**Returns:** `Promise<Object|null>`
