# Module API Express (`server.js`)

Serveur API Express embarqué fournissant des endpoints REST pour le Renderer.

## Method Summary
| Modifier and Type | Method | Description |
|---|---|---|
| `void` | `authenticate(req, res, next)` | Middleware d'authentification vérifiant le header `x-user-matricule`. |
| `Object` | `formatRow(row)` | Formate un objet issu de MySQL pour avoir des clés en PascalCase. |
| `Promise<void>` | `startServer()` | Démarre le serveur Express local sur le port 8765. |
| `void` | `stopServer()` | Arrête proprement le serveur Express. |

## Endpoints Principaux
- **POST `/api/auth/login`** : Authentification.
- **GET `/api/gestionnaire/stats`** : Statistiques.
- **GET `/api/gestionnaire/clients`** : Liste des clients.
- **POST `/api/gestionnaire/interventions`** : Assigner une intervention.
- **GET `/api/technicien/interventions`** : Interventions d'un technicien.
- **POST `/api/technicien/controler`** : Valider le contrôle d'un matériel.
