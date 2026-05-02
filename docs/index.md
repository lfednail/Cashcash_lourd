# Documentation Technique - CashCash Desktop (Jalon 3)

## 1. Vue d'ensemble de l'application
- **Description globale** : CashCash est une application de bureau (desktop) destinée à la gestion des interventions de maintenance.
- **Objectifs** : Fournir une interface performante pour les gestionnaires et les techniciens.
- **Fonctionnalités principales** : Authentification, Tableau de bord, Gestion des clients/matériels/contrats, Assignation, Validation des contrôles, Export XML, Relances PDF.

## 2. Architecture du projet
- **Processus Main (Electron)** : Initialise la fenêtre et lance le serveur Express.
- **Processus Renderer (Chromium)** : Interface HTML/CSS, isolée de Node.js.
- **Serveur API (Express)** : API locale sur le port 8765, connectée à MySQL.

## 3. Sommaire de la documentation de l'API (Style JavaDoc)
- [Processus Main & IPC](main_process.md)
- [Serveur API (Express)](server_api.md)

**Classes Métier :**
- [Client](classes/Client.md)
- [ContratMaintenance](classes/ContratMaintenance.md)
- [Materiel](classes/Materiel.md)
- [GestionMateriels](classes/GestionMateriels.md)
- [PersistanceSQL](classes/PersistanceSQL.md)
- [Famille](classes/Famille.md)
- [TypeMateriel](classes/TypeMateriel.md)

## 4. Événements et communication
- **IPC** : `save-file`, `get-app-path`.
- **HTTP** : Requêtes REST du Renderer vers le serveur Express.

## 5. Instructions d'utilisation
1. **Installation** : `npm install`
2. **Configuration** : Fichier `.env` avec `DB_HOST`, `DB_USER`, etc.
3. **Lancement** : `npm run dev`
