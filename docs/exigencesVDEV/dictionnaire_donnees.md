# Dictionnaire de Données - CashCash

Ce document détaille la structure de la base de données de l'application CashCash.

## 1. Table : Client
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **NumeroClient** | VARCHAR(10) | PK | Identifiant unique du client |
| RaisonSociale | VARCHAR(100) | NOT NULL | Nom de l'entreprise client |
| Adresse | VARCHAR(255) | | Adresse du siège |
| TelephoneClient | VARCHAR(20) | | Numéro de téléphone |
| Email | VARCHAR(100) | | Email de contact |
| Siren | VARCHAR(14) | | Numéro SIREN |
| CodeApe | VARCHAR(5) | | Code APE |
| DistanceKM | INT | | Distance depuis l'agence (km) |
| DureeDeplacement | INT | | Temps de trajet (minutes) |
| NumeroAgence | INT | FK (Agence) | Agence de rattachement |

## 2. Table : Agence
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **NumeroAgence** | INT | PK, AI | Identifiant unique de l'agence |
| NomAgence | VARCHAR(100) | NOT NULL | Nom de l'agence |
| AdresseAgence | VARCHAR(255) | | Adresse physique |
| TelephoneAgence | VARCHAR(20) | | Téléphone de l'agence |

## 3. Table : Employe
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **Matricule** | VARCHAR(10) | PK | Identifiant unique de l'employé |
| NomEmploye | VARCHAR(50) | NOT NULL | Nom de famille |
| PrenomEmploye | VARCHAR(50) | NOT NULL | Prénom |
| AdresseEmploye | VARCHAR(255) | | Adresse personnelle |
| DateEmbauche | DATE | | Date d'arrivée |
| Email | VARCHAR(100) | UNIQUE | Identifiant de connexion |
| mot_de_passe | VARCHAR(255) | | Hash du mot de passe |
| Role | ENUM | | 'ADMIN', 'GESTIONNAIRE', 'TECHNICIEN' |
| NumeroAgence | INT | FK (Agence) | Agence d'affectation |

## 4. Table : Technicien
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **Matricule** | VARCHAR(10) | PK, FK (Employe) | Matricule de l'employé technicien |
| TelephoneMobile | VARCHAR(20) | | Téléphone professionnel |
| Qualification | VARCHAR(100) | | Spécialisation technique |
| DateObtention | DATE | | Date d'obtention du diplôme/qualif |

## 5. Table : Intervention
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **NumeroIntervent** | INT | PK, AI | Identifiant de l'intervention |
| DateVisite | DATE | | Date prévue de l'intervention |
| HeureVisite | TIME | | Heure prévue |
| MatriculeTechnicien | VARCHAR(10) | FK (Technicien) | Technicien assigné |
| NumeroClient | VARCHAR(10) | FK (Client) | Client à visiter |

## 6. Table : ContratMaintenance
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **NumeroContrat** | VARCHAR(20) | PK | Identifiant du contrat |
| DateSignature | DATE | | Date de début |
| DateEcheance | DATE | | Date de fin |
| NumeroClient | VARCHAR(10) | FK (Client) | Client souscripteur |
| RefTypeContrat | VARCHAR(10) | FK (TypeContrat) | Type de contrat |

## 7. Table : Materiel
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **NumeroSerie** | VARCHAR(50) | PK | Identifiant unique du matériel |
| DateInstallation | DATE | | Date de mise en service |
| PrixVente | DECIMAL(10,2) | | Valeur du matériel |
| Emplacement | VARCHAR(100) | | Localisation chez le client |
| NumeroClient | VARCHAR(10) | FK (Client) | Propriétaire actuel |
| ReferenceType | VARCHAR(20) | FK (TypeMateriel) | Type d'équipement |
| NumeroContrat | VARCHAR(20) | FK (Contrat) | Contrat couvrant ce matériel |

## 8. Table : Controler
| Nom | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| **NumeroIntervent** | INT | PK, FK | Référence intervention |
| **NumeroSerieMateriel** | VARCHAR(50) | PK, FK | Référence matériel contrôlé |
| TempsPasse | INT | | Temps passé sur ce contrôle (min) |
| Commentaire | TEXT | | Remarques du technicien |

---
*Légende : PK = Primary Key (Clé Primaire), FK = Foreign Key (Clé Étrangère), AI = Auto Increment.*
