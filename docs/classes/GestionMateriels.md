# Class GestionMateriels
Classe de service orchestrant la gestion des clients et de leurs matériels.

## Constructor Summary
| Constructor | Description |
|---|---|
| `GestionMateriels(lesDonnees)` | Instancie le service avec un système de persistance. |

## Method Summary
| Modifier and Type | Method | Description |
|---|---|---|
| `Promise<Client>` | `getClient(idClient)` | Retourne l'objet Client avec ses liens (contrat, matériels). |
| `string` | `XmlClient(unClient)` | Retourne une chaîne XML de la liste des matériels. |
| `static boolean` | `XmlClientValide(xml)` | Valide la structure du XML. |

## Method Detail
### getClient
```javascript
async getClient(idClient)
```
Charge le client et ses dépendances.
**Parameters:** `idClient` (`number`)
**Returns:** `Promise<Client|null>`

### XmlClient
```javascript
XmlClient(unClient)
```
**Parameters:** `unClient` (`Client`)
**Returns:** `string`

### XmlClientValide
```javascript
static XmlClientValide(xml)
```
**Parameters:** `xml` (`string`)
**Returns:** `boolean`
