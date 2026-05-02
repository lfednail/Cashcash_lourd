# Class Client
Classe représentant un client de CashCash.

## Constructor Summary
| Constructor | Description |
|---|---|
| `Client(numClient, raisonSociale, siren, codeApe, adresse, telClient, email, dureeDeplacement, distanceKm)` | Crée une instance de Client. |

## Method Summary
| Modifier and Type | Method | Description |
|---|---|---|
| `Array<Materiel>` | `getMateriels()` | Retourne l'ensemble des matériels du client. |
| `Array<Materiel>` | `getMaterielsSousContrat()` | Retourne l'ensemble des matériels pour lesquels le client a souscrit un contrat valide. |
| `boolean` | `estAssure()` | Retourne vrai si le client est assuré (possède un contrat valide). |

## Constructor Detail
### Client
```javascript
constructor(numClient, raisonSociale, siren, codeApe, adresse, telClient, email, dureeDeplacement, distanceKm)
```
**Parameters:**
- `numClient` (string) - Numéro unique du client.
- `raisonSociale` (string) - Raison sociale.
- `siren` (string) - Numéro SIREN.
- `codeApe` (string) - Code APE.
- `adresse` (string) - Adresse postale.
- `telClient` (string) - Téléphone.
- `email` (string) - Email.
- `dureeDeplacement` (number) - Temps de déplacement estimé (minutes).
- `distanceKm` (number) - Distance estimée (kilomètres).

## Method Detail
### getMateriels
```javascript
getMateriels()
```
Retourne l'ensemble des matériels du client.
**Returns:** `Array<Materiel>`

### getMaterielsSousContrat
```javascript
getMaterielsSousContrat()
```
Retourne l'ensemble des matériels assurés.
**Returns:** `Array<Materiel>`

### estAssure
```javascript
estAssure()
```
Vérifie si le client a un contrat valide.
**Returns:** `boolean`
