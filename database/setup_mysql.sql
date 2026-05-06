-- Script de création de la base de données CashCash (MySQL / MariaDB)
-- Environnement : Windows
-- Projet : AP2025 - Jalon 3

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Schéma de la base de données
-- -----------------------------------------------------
CREATE DATABASE IF NOT EXISTS cashcash_final_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cashcash_final_app;

-- -----------------------------------------------------
-- Table Agence
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Agence (
  NumeroAgence INT NOT NULL AUTO_INCREMENT,
  NomAgence VARCHAR(100) NOT NULL,
  AdresseAgence VARCHAR(255) NULL,
  TelephoneAgence VARCHAR(20) NULL,
  PRIMARY KEY (NumeroAgence)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table Employe (Héritage exclusif total implémenté via Role)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Employe (
  Matricule VARCHAR(10) NOT NULL,
  NomEmploye VARCHAR(50) NOT NULL,
  PrenomEmploye VARCHAR(50) NOT NULL,
  AdresseEmploye VARCHAR(255) NULL,
  DateEmbauche DATE NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'GESTIONNAIRE', 'TECHNICIEN') NOT NULL,
  NumeroAgence INT NOT NULL,
  PRIMARY KEY (Matricule),
  INDEX idx_agence (NumeroAgence),
  CONSTRAINT fk_employe_agence FOREIGN KEY (NumeroAgence) REFERENCES Agence (NumeroAgence) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table Technicien (Spécialisation d'Employé)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Technicien (
  Matricule VARCHAR(10) NOT NULL,
  TelephoneMobile VARCHAR(20) NULL,
  Qualification VARCHAR(100) NULL,
  DateObtention DATE NULL,
  PRIMARY KEY (Matricule),
  CONSTRAINT fk_tech_employe FOREIGN KEY (Matricule) REFERENCES Employe (Matricule) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table Famille
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Famille (
  CodeFamille VARCHAR(10) NOT NULL,
  LibelleFamille VARCHAR(100) NOT NULL,
  PRIMARY KEY (CodeFamille)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table TypeMateriel
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TypeMateriel (
  ReferenceInterne VARCHAR(20) NOT NULL,
  LibelleTypeMateriel VARCHAR(100) NOT NULL,
  CodeFamille VARCHAR(10) NOT NULL,
  PRIMARY KEY (ReferenceInterne),
  CONSTRAINT fk_type_famille FOREIGN KEY (CodeFamille) REFERENCES Famille (CodeFamille) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table TypeContrat
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS TypeContrat (
  RefTypeContrat VARCHAR(10) NOT NULL,
  DelaiIntervention INT NOT NULL COMMENT 'en jours',
  TauxApplicable DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (RefTypeContrat)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table Client
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Client (
  NumeroClient VARCHAR(10) NOT NULL,
  RaisonSociale VARCHAR(100) NOT NULL,
  Adresse VARCHAR(255) NULL,
  TelephoneClient VARCHAR(20) NULL,
  Email VARCHAR(100) NULL,
  Siren VARCHAR(14) NULL,
  CodeApe VARCHAR(5) NULL,
  DistanceKM INT DEFAULT 0,
  DureeDeplacement INT DEFAULT 0,
  NumeroAgence INT NOT NULL,
  PRIMARY KEY (NumeroClient),
  CONSTRAINT fk_client_agence FOREIGN KEY (NumeroAgence) REFERENCES Agence (NumeroAgence) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table ContratMaintenance
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ContratMaintenance (
  NumeroContrat VARCHAR(20) NOT NULL,
  DateSignature DATE NOT NULL,
  DateEcheance DATE NOT NULL,
  NumeroClient VARCHAR(10) NOT NULL,
  RefTypeContrat VARCHAR(10) NOT NULL,
  PRIMARY KEY (NumeroContrat),
  CONSTRAINT fk_contrat_client FOREIGN KEY (NumeroClient) REFERENCES Client (NumeroClient) ON DELETE CASCADE,
  CONSTRAINT fk_contrat_type FOREIGN KEY (RefTypeContrat) REFERENCES TypeContrat (RefTypeContrat) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table Materiel
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Materiel (
  NumeroSerie VARCHAR(50) NOT NULL,
  DateInstallation DATE NULL,
  PrixVente DECIMAL(10,2) NULL,
  Emplacement VARCHAR(100) NULL,
  NumeroClient VARCHAR(10) NOT NULL,
  ReferenceInterneTypeMateriel VARCHAR(20) NOT NULL,
  NumeroContrat VARCHAR(20) NULL,
  PRIMARY KEY (NumeroSerie),
  CONSTRAINT fk_mat_client FOREIGN KEY (NumeroClient) REFERENCES Client (NumeroClient) ON DELETE CASCADE,
  CONSTRAINT fk_mat_type FOREIGN KEY (ReferenceInterneTypeMateriel) REFERENCES TypeMateriel (ReferenceInterne) ON DELETE RESTRICT,
  CONSTRAINT fk_mat_contrat FOREIGN KEY (NumeroContrat) REFERENCES ContratMaintenance (NumeroContrat) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table Intervention
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Intervention (
  NumeroIntervent INT NOT NULL AUTO_INCREMENT,
  DateVisite DATE NOT NULL,
  HeureVisite TIME NOT NULL,
  MatriculeTechnicien VARCHAR(10) NOT NULL,
  NumeroClient VARCHAR(10) NOT NULL,
  PRIMARY KEY (NumeroIntervent),
  CONSTRAINT fk_inter_tech FOREIGN KEY (MatriculeTechnicien) REFERENCES Technicien (Matricule) ON DELETE RESTRICT,
  CONSTRAINT fk_inter_client FOREIGN KEY (NumeroClient) REFERENCES Client (NumeroClient) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table Controler (Relation n..n)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Controler (
  NumeroIntervent INT NOT NULL,
  NumeroSerieMateriel VARCHAR(50) NOT NULL,
  TempsPasse INT DEFAULT 0 COMMENT 'en minutes',
  Commentaire TEXT NULL,
  PRIMARY KEY (NumeroIntervent, NumeroSerieMateriel),
  CONSTRAINT fk_ctrl_inter FOREIGN KEY (NumeroIntervent) REFERENCES Intervention (NumeroIntervent) ON DELETE CASCADE,
  CONSTRAINT fk_ctrl_mat FOREIGN KEY (NumeroSerieMateriel) REFERENCES Materiel (NumeroSerie) ON DELETE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- FONCTIONNALITÉS AVANCÉES (PL/SQL / MySQL Procedural)
-- -----------------------------------------------------

DELIMITER //

-- Procédure de statistiques mensuelles par agence
CREATE PROCEDURE GetAgenceStats(IN p_num_agence INT, IN p_mois INT, IN p_annee INT)
BEGIN
    SELECT 
        COUNT(DISTINCT i.NumeroIntervent) AS NbInterventions,
        COALESCE(SUM(c.DistanceKM * 2), 0) AS TotalDistanceKM,
        COALESCE(SUM(ct.TempsPasse), 0) AS TotalTempsMinutes
    FROM Intervention i
    JOIN Client c ON i.NumeroClient = c.NumeroClient
    LEFT JOIN Controler ct ON i.NumeroIntervent = ct.NumeroIntervent
    WHERE c.NumeroAgence = p_num_agence
      AND MONTH(i.DateVisite) = p_mois
      AND YEAR(i.DateVisite) = p_annee;
END //

-- Déclencheur pour empêcher l'insertion d'un matériel sans client
CREATE TRIGGER BEFORE_INSERT_MATERIEL
BEFORE INSERT ON Materiel
FOR EACH ROW
BEGIN
    IF NEW.NumeroClient IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un matériel doit obligatoirement être rattaché à un client.';
    END IF;
END //

DELIMITER ;

-- -----------------------------------------------------
-- JEU D'ESSAI CONSÉQUENT
-- -----------------------------------------------------

-- Agences
INSERT INTO Agence (NomAgence, AdresseAgence, TelephoneAgence) VALUES 
('Agence Nord - Lille', '12 rue de la Paix, 59000 Lille', '03.20.00.00.01'),
('Agence Sud - Marseille', '45 avenue du Prado, 13000 Marseille', '04.91.00.00.02'),
('Agence Ouest - Nantes', '8 quai de la Fosse, 44000 Nantes', '02.40.00.00.03');

-- Employés (Mot de passe 'password123' hashé bcrypt)
INSERT INTO Employe (Matricule, NomEmploye, PrenomEmploye, AdresseEmploye, DateEmbauche, email, mot_de_passe, role, NumeroAgence) VALUES 
('EMP001', 'DURAND', 'Jean', '1 rue des Fleurs, Lille', '2020-01-15', 'admin@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'ADMIN', 1),
('EMP002', 'LEROY', 'Alice', '5 rue de la Gare, Lille', '2021-06-01', 'gestion@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'GESTIONNAIRE', 1),
('TECH001', 'MARTIN', 'Paul', '10 bd Victor Hugo, Lille', '2022-03-10', 'paul.martin@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'TECHNICIEN', 1),
('TECH002', 'DUBOIS', 'Sophie', '22 rue des Lilas, Marseille', '2022-05-15', 'sophie.dubois@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'TECHNICIEN', 2);

-- Techniciens
INSERT INTO Technicien (Matricule, TelephoneMobile, Qualification, DateObtention) VALUES 
('TECH001', '06.12.34.56.78', 'Expert Systèmes d''encaissement', '2021-12-20'),
('TECH002', '06.98.76.54.32', 'Maintenance Terminaux Mobiles', '2022-01-10');

-- Familles & Types
INSERT INTO Famille (CodeFamille, LibelleFamille) VALUES 
('POS', 'Points de Vente'),
('TPE', 'Terminaux de Paiement');

INSERT INTO TypeMateriel (ReferenceInterne, LibelleTypeMateriel, CodeFamille) VALUES 
('POS-V3', 'Caisse Tactile V3', 'POS'),
('TPE-WIFI', 'TPE Portable Wifi', 'TPE'),
('SCAN-BT', 'Douchette Bluetooth', 'POS');

-- Types de Contrat
INSERT INTO TypeContrat (RefTypeContrat, DelaiIntervention, TauxApplicable) VALUES 
('GOLD', 4, 1.50),
('SILVER', 24, 1.20),
('BASIC', 48, 1.00);

-- Clients
INSERT INTO Client (NumeroClient, RaisonSociale, Adresse, TelephoneClient, Email, Siren, CodeApe, DistanceKM, DureeDeplacement, NumeroAgence) VALUES 
('CLI001', 'Boulangerie du Coin', '2 rue du Pain, Lille', '03.20.11.22.33', 'contact@painlille.fr', '12345678900010', '4724Z', 5, 15, 1),
('CLI002', 'Super U Marseille', '100 av du Prado, Marseille', '04.91.22.33.44', 'admin@superu-marseille.com', '98765432100025', '4711F', 12, 30, 2),
('CLI003', 'Tabac de la Mairie', '1 place de la Mairie, Nantes', '02.40.55.66.77', 'jean.nantes@orange.fr', '11223344556677', '4726Z', 8, 20, 3);

-- Contrats
INSERT INTO ContratMaintenance (NumeroContrat, DateSignature, DateEcheance, NumeroClient, RefTypeContrat) VALUES 
('CONT-001', '2024-01-01', '2025-01-01', 'CLI001', 'GOLD'),
('CONT-002', '2024-03-15', '2025-03-15', 'CLI002', 'SILVER');

-- Matériels
INSERT INTO Materiel (NumeroSerie, DateInstallation, PrixVente, Emplacement, NumeroClient, ReferenceInterneTypeMateriel, NumeroContrat) VALUES 
('SN-1001', '2024-01-05', 1200.00, 'Comptoir Principal', 'CLI001', 'POS-V3', 'CONT-001'),
('SN-1002', '2024-01-05', 450.00, 'Réserve', 'CLI001', 'TPE-WIFI', 'CONT-001'),
('SN-2001', '2024-03-20', 2500.00, 'Caisse 1', 'CLI002', 'POS-V3', 'CONT-002'),
('SN-2002', '2024-03-20', 2500.00, 'Caisse 2', 'CLI002', 'POS-V3', 'CONT-002');

-- Interventions
INSERT INTO Intervention (DateVisite, HeureVisite, MatriculeTechnicien, NumeroClient) VALUES 
('2024-04-10', '14:30:00', 'TECH001', 'CLI001'),
('2024-04-12', '09:00:00', 'TECH002', 'CLI002');

-- Contrôles effectués
INSERT INTO Controler (NumeroIntervent, NumeroSerieMateriel, TempsPasse, Commentaire) VALUES 
(1, 'SN-1001', 45, 'Mise à jour logicielle effectuée.'),
(1, 'SN-1002', 15, 'Batterie OK.'),
(2, 'SN-2001', 60, 'Nettoyage tête thermique.');

SET FOREIGN_KEY_CHECKS = 1;
