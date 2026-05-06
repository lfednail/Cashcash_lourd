-- Script de création de la base de données CashCash (PostgreSQL)
-- Environnement : Linux
-- Projet : AP2025 - Jalon 3

-- Suppression si existe
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- -----------------------------------------------------
-- Table Agence
-- -----------------------------------------------------
CREATE TABLE Agence (
  NumeroAgence SERIAL PRIMARY KEY,
  NomAgence VARCHAR(100) NOT NULL,
  AdresseAgence VARCHAR(255) NULL,
  TelephoneAgence VARCHAR(20) NULL
);

-- -----------------------------------------------------
-- Table Employe
-- -----------------------------------------------------
CREATE TYPE user_role AS ENUM ('ADMIN', 'GESTIONNAIRE', 'TECHNICIEN');

CREATE TABLE Employe (
  Matricule VARCHAR(10) PRIMARY KEY,
  NomEmploye VARCHAR(50) NOT NULL,
  PrenomEmploye VARCHAR(50) NOT NULL,
  AdresseEmploye VARCHAR(255) NULL,
  DateEmbauche DATE NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  NumeroAgence INT NOT NULL REFERENCES Agence(NumeroAgence) ON DELETE RESTRICT
);

-- -----------------------------------------------------
-- Table Technicien
-- -----------------------------------------------------
CREATE TABLE Technicien (
  Matricule VARCHAR(10) PRIMARY KEY REFERENCES Employe(Matricule) ON DELETE CASCADE,
  TelephoneMobile VARCHAR(20) NULL,
  Qualification VARCHAR(100) NULL,
  DateObtention DATE NULL
);

-- -----------------------------------------------------
-- Table Famille
-- -----------------------------------------------------
CREATE TABLE Famille (
  CodeFamille VARCHAR(10) PRIMARY KEY,
  LibelleFamille VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------
-- Table TypeMateriel
-- -----------------------------------------------------
CREATE TABLE TypeMateriel (
  ReferenceInterne VARCHAR(20) PRIMARY KEY,
  LibelleTypeMateriel VARCHAR(100) NOT NULL,
  CodeFamille VARCHAR(10) NOT NULL REFERENCES Famille(CodeFamille) ON DELETE RESTRICT
);

-- -----------------------------------------------------
-- Table TypeContrat
-- -----------------------------------------------------
CREATE TABLE TypeContrat (
  RefTypeContrat VARCHAR(10) PRIMARY KEY,
  DelaiIntervention INT NOT NULL,
  TauxApplicable DECIMAL(5,2) NOT NULL
);

-- -----------------------------------------------------
-- Table Client
-- -----------------------------------------------------
CREATE TABLE Client (
  NumeroClient VARCHAR(10) PRIMARY KEY,
  RaisonSociale VARCHAR(100) NOT NULL,
  Adresse VARCHAR(255) NULL,
  TelephoneClient VARCHAR(20) NULL,
  Email VARCHAR(100) NULL,
  Siren VARCHAR(14) NULL,
  CodeApe VARCHAR(5) NULL,
  DistanceKM INT DEFAULT 0,
  DureeDeplacement INT DEFAULT 0,
  NumeroAgence INT NOT NULL REFERENCES Agence(NumeroAgence) ON DELETE RESTRICT
);

-- -----------------------------------------------------
-- Table ContratMaintenance
-- -----------------------------------------------------
CREATE TABLE ContratMaintenance (
  NumeroContrat VARCHAR(20) PRIMARY KEY,
  DateSignature DATE NOT NULL,
  DateEcheance DATE NOT NULL,
  NumeroClient VARCHAR(10) NOT NULL REFERENCES Client(NumeroClient) ON DELETE CASCADE,
  RefTypeContrat VARCHAR(10) NOT NULL REFERENCES TypeContrat(RefTypeContrat) ON DELETE RESTRICT
);

-- -----------------------------------------------------
-- Table Materiel
-- -----------------------------------------------------
CREATE TABLE Materiel (
  NumeroSerie VARCHAR(50) PRIMARY KEY,
  DateInstallation DATE NULL,
  PrixVente DECIMAL(10,2) NULL,
  Emplacement VARCHAR(100) NULL,
  NumeroClient VARCHAR(10) NOT NULL REFERENCES Client(NumeroClient) ON DELETE CASCADE,
  ReferenceInterneTypeMateriel VARCHAR(20) NOT NULL REFERENCES TypeMateriel(ReferenceInterne) ON DELETE RESTRICT,
  NumeroContrat VARCHAR(20) NULL REFERENCES ContratMaintenance(NumeroContrat) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table Intervention
-- -----------------------------------------------------
CREATE TABLE Intervention (
  NumeroIntervent SERIAL PRIMARY KEY,
  DateVisite DATE NOT NULL,
  HeureVisite TIME NOT NULL,
  MatriculeTechnicien VARCHAR(10) NOT NULL REFERENCES Technicien(Matricule) ON DELETE RESTRICT,
  NumeroClient VARCHAR(10) NOT NULL REFERENCES Client(NumeroClient) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table Controler
-- -----------------------------------------------------
CREATE TABLE Controler (
  NumeroIntervent INT NOT NULL REFERENCES Intervention(NumeroIntervent) ON DELETE CASCADE,
  NumeroSerieMateriel VARCHAR(50) NOT NULL REFERENCES Materiel(NumeroSerie) ON DELETE CASCADE,
  TempsPasse INT DEFAULT 0,
  Commentaire TEXT NULL,
  PRIMARY KEY (NumeroIntervent, NumeroSerieMateriel)
);

-- -----------------------------------------------------
-- FONCTIONNALITÉS AVANCÉES (PL/pgSQL)
-- -----------------------------------------------------

-- Fonction de statistiques mensuelles par agence
CREATE OR REPLACE FUNCTION GetAgenceStats(p_num_agence INT, p_mois INT, p_annee INT)
RETURNS TABLE (NbInterventions BIGINT, TotalDistanceKM BIGINT, TotalTempsMinutes BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT i.NumeroIntervent),
        COALESCE(SUM(c.DistanceKM * 2), 0)::BIGINT,
        COALESCE(SUM(ct.TempsPasse), 0)::BIGINT
    FROM Intervention i
    JOIN Client c ON i.NumeroClient = c.NumeroClient
    LEFT JOIN Controler ct ON i.NumeroIntervent = ct.NumeroIntervent
    WHERE c.NumeroAgence = p_num_agence
      AND EXTRACT(MONTH FROM i.DateVisite) = p_mois
      AND EXTRACT(YEAR FROM i.DateVisite) = p_annee;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour empêcher l'insertion d'un matériel sans client
CREATE OR REPLACE FUNCTION check_materiel_client()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.NumeroClient IS NULL THEN
        RAISE EXCEPTION 'Un matériel doit obligatoirement être rattaché à un client.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER BEFORE_INSERT_MATERIEL
BEFORE INSERT ON Materiel
FOR EACH ROW
EXECUTE FUNCTION check_materiel_client();

-- -----------------------------------------------------
-- JEU D'ESSAI
-- -----------------------------------------------------

INSERT INTO Agence (NomAgence, AdresseAgence, TelephoneAgence) VALUES 
('Agence Nord - Lille', '12 rue de la Paix, 59000 Lille', '03.20.00.00.01'),
('Agence Sud - Marseille', '45 avenue du Prado, 13000 Marseille', '04.91.00.00.02'),
('Agence Ouest - Nantes', '8 quai de la Fosse, 44000 Nantes', '02.40.00.00.03');

INSERT INTO Employe (Matricule, NomEmploye, PrenomEmploye, AdresseEmploye, DateEmbauche, email, mot_de_passe, role, NumeroAgence) VALUES 
('EMP001', 'DURAND', 'Jean', '1 rue des Fleurs, Lille', '2020-01-15', 'admin@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'ADMIN', 1),
('EMP002', 'LEROY', 'Alice', '5 rue de la Gare, Lille', '2021-06-01', 'gestion@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'GESTIONNAIRE', 1),
('TECH001', 'MARTIN', 'Paul', '10 bd Victor Hugo, Lille', '2022-03-10', 'paul.martin@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'TECHNICIEN', 1),
('TECH002', 'DUBOIS', 'Sophie', '22 rue des Lilas, Marseille', '2022-05-15', 'sophie.dubois@cashcash.fr', '$2b$10$7qNfP6V/I7Iq.vSgZ7yZ9e2g1rG.i1Q1rG1rG1rG1rG1rG1rG1rG1', 'TECHNICIEN', 2);

INSERT INTO Technicien (Matricule, TelephoneMobile, Qualification, DateObtention) VALUES 
('TECH001', '06.12.34.56.78', 'Expert Systèmes d''encaissement', '2021-12-20'),
('TECH002', '06.98.76.54.32', 'Maintenance Terminaux Mobiles', '2022-01-10');

INSERT INTO Famille (CodeFamille, LibelleFamille) VALUES ('POS', 'Points de Vente'), ('TPE', 'Terminaux de Paiement');
INSERT INTO TypeMateriel (ReferenceInterne, LibelleTypeMateriel, CodeFamille) VALUES ('POS-V3', 'Caisse Tactile V3', 'POS'), ('TPE-WIFI', 'TPE Portable Wifi', 'TPE');
INSERT INTO TypeContrat (RefTypeContrat, DelaiIntervention, TauxApplicable) VALUES ('GOLD', 4, 1.50), ('SILVER', 24, 1.20);

INSERT INTO Client (NumeroClient, RaisonSociale, Adresse, TelephoneClient, Email, Siren, CodeApe, DistanceKM, DureeDeplacement, NumeroAgence) VALUES 
('CLI001', 'Boulangerie du Coin', '2 rue du Pain, Lille', '03.20.11.22.33', 'contact@painlille.fr', '12345678900010', '4724Z', 5, 15, 1),
('CLI002', 'Super U Marseille', '100 av du Prado, Marseille', '04.91.22.33.44', 'admin@superu-marseille.com', '98765432100025', '4711F', 12, 30, 2);

INSERT INTO ContratMaintenance (NumeroContrat, DateSignature, DateEcheance, NumeroClient, RefTypeContrat) VALUES 
('CONT-001', '2024-01-01', '2025-01-01', 'CLI001', 'GOLD'),
('CONT-002', '2024-03-15', '2025-03-15', 'CLI002', 'SILVER');

INSERT INTO Materiel (NumeroSerie, DateInstallation, PrixVente, Emplacement, NumeroClient, ReferenceInterneTypeMateriel, NumeroContrat) VALUES 
('SN-1001', '2024-01-05', 1200.00, 'Comptoir Principal', 'CLI001', 'POS-V3', 'CONT-001'),
('SN-2001', '2024-03-20', 2500.00, 'Caisse 1', 'CLI002', 'POS-V3', 'CONT-002');

INSERT INTO Intervention (DateVisite, HeureVisite, MatriculeTechnicien, NumeroClient) VALUES 
('2024-04-10', '14:30:00', 'TECH001', 'CLI001');

INSERT INTO Controler (NumeroIntervent, NumeroSerieMateriel, TempsPasse, Commentaire) VALUES (1, 'SN-1001', 45, 'Mise à jour logicielle effectuée.');
