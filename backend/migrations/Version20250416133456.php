<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250416133456 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE auto_ecole_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE centre_examen_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE circuit_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE compte_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE cours_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE eleve_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE langue_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE media_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE moniteur_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE pays_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE permis_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE point_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE ville_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE auto_ecole (id INT NOT NULL, ville_id INT DEFAULT NULL, compte_id INT DEFAULT NULL, numero_agrement VARCHAR(255) NOT NULL, adresse VARCHAR(255) DEFAULT NULL, libelle VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_FD0557A73F0036 ON auto_ecole (ville_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FD0557F2C56620 ON auto_ecole (compte_id)');
        $this->addSql('CREATE TABLE centre_examen (id INT NOT NULL, ville_id INT DEFAULT NULL, libelle VARCHAR(255) NOT NULL, adresse VARCHAR(255) DEFAULT NULL, latitude NUMERIC(12, 8) NOT NULL, longitude NUMERIC(12, 8) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_82F1814BA73F0036 ON centre_examen (ville_id)');
        $this->addSql('CREATE TABLE circuit (id INT NOT NULL, ville_centre_id INT DEFAULT NULL, id_moniteur_id INT NOT NULL, libelle VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_1325F3A6A1461B2E ON circuit (ville_centre_id)');
        $this->addSql('CREATE INDEX IDX_1325F3A6BA266824 ON circuit (id_moniteur_id)');
        $this->addSql('CREATE TABLE circuit_media (circuit_id INT NOT NULL, media_id INT NOT NULL, PRIMARY KEY(circuit_id, media_id))');
        $this->addSql('CREATE INDEX IDX_A949D7CBCF2182C8 ON circuit_media (circuit_id)');
        $this->addSql('CREATE INDEX IDX_A949D7CBEA9FDD75 ON circuit_media (media_id)');
        $this->addSql('CREATE TABLE circuit_cours (circuit_id INT NOT NULL, cours_id INT NOT NULL, PRIMARY KEY(circuit_id, cours_id))');
        $this->addSql('CREATE INDEX IDX_3EAFFA5BCF2182C8 ON circuit_cours (circuit_id)');
        $this->addSql('CREATE INDEX IDX_3EAFFA5B7ECF78B0 ON circuit_cours (cours_id)');
        $this->addSql('CREATE TABLE compte (id INT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, raison_sociale VARCHAR(255) DEFAULT NULL, nom VARCHAR(255) DEFAULT NULL, prenom VARCHAR(255) DEFAULT NULL, telephone VARCHAR(255) DEFAULT NULL, biographie TEXT DEFAULT NULL, photo_profil VARCHAR(1000) DEFAULT NULL, genre VARCHAR(255) DEFAULT NULL, date_naissance DATE DEFAULT NULL, note_moyenne NUMERIC(10, 0) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON compte (email)');
        $this->addSql('CREATE TABLE compte_langue (compte_id INT NOT NULL, langue_id INT NOT NULL, PRIMARY KEY(compte_id, langue_id))');
        $this->addSql('CREATE INDEX IDX_49CE2CB9F2C56620 ON compte_langue (compte_id)');
        $this->addSql('CREATE INDEX IDX_49CE2CB92AADBACD ON compte_langue (langue_id)');
        $this->addSql('CREATE TABLE compte_permis (compte_id INT NOT NULL, permis_id INT NOT NULL, PRIMARY KEY(compte_id, permis_id))');
        $this->addSql('CREATE INDEX IDX_CDA1CD64F2C56620 ON compte_permis (compte_id)');
        $this->addSql('CREATE INDEX IDX_CDA1CD643594A24E ON compte_permis (permis_id)');
        $this->addSql('CREATE TABLE cours (id INT NOT NULL, moniteur_id INT DEFAULT NULL, libelle VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_FDCA8C9CA234A5D3 ON cours (moniteur_id)');
        $this->addSql('CREATE TABLE eleve (id INT NOT NULL, compte_id INT DEFAULT NULL, auto_ecole_id INT DEFAULT NULL, date_examen_pratique DATE DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ECA105F7F2C56620 ON eleve (compte_id)');
        $this->addSql('CREATE INDEX IDX_ECA105F7B1C987E1 ON eleve (auto_ecole_id)');
        $this->addSql('CREATE TABLE eleve_centre_examen (eleve_id INT NOT NULL, centre_examen_id INT NOT NULL, PRIMARY KEY(eleve_id, centre_examen_id))');
        $this->addSql('CREATE INDEX IDX_F2234D06A6CC7B2 ON eleve_centre_examen (eleve_id)');
        $this->addSql('CREATE INDEX IDX_F2234D06F2ACCC13 ON eleve_centre_examen (centre_examen_id)');
        $this->addSql('CREATE TABLE eleve_cours (eleve_id INT NOT NULL, cours_id INT NOT NULL, PRIMARY KEY(eleve_id, cours_id))');
        $this->addSql('CREATE INDEX IDX_E2AA9175A6CC7B2 ON eleve_cours (eleve_id)');
        $this->addSql('CREATE INDEX IDX_E2AA91757ECF78B0 ON eleve_cours (cours_id)');
        $this->addSql('CREATE TABLE eleve_circuit (eleve_id INT NOT NULL, circuit_id INT NOT NULL, PRIMARY KEY(eleve_id, circuit_id))');
        $this->addSql('CREATE INDEX IDX_FF9FC8BAA6CC7B2 ON eleve_circuit (eleve_id)');
        $this->addSql('CREATE INDEX IDX_FF9FC8BACF2182C8 ON eleve_circuit (circuit_id)');
        $this->addSql('CREATE TABLE langue (id INT NOT NULL, code_iso VARCHAR(255) NOT NULL, libelle VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE media (id INT NOT NULL, compte_id INT DEFAULT NULL, cours_id INT DEFAULT NULL, moniteur_id INT DEFAULT NULL, nom_fichier VARCHAR(255) NOT NULL, titre VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, extension VARCHAR(255) NOT NULL, type VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_6A2CA10C6EF95ED7 ON media (nom_fichier)');
        $this->addSql('CREATE INDEX IDX_6A2CA10CF2C56620 ON media (compte_id)');
        $this->addSql('CREATE INDEX IDX_6A2CA10C7ECF78B0 ON media (cours_id)');
        $this->addSql('CREATE INDEX IDX_6A2CA10CA234A5D3 ON media (moniteur_id)');
        $this->addSql('CREATE TABLE moniteur (id INT NOT NULL, compte_id INT DEFAULT NULL, date_debut_carriere DATE DEFAULT NULL, numero_certification VARCHAR(255) DEFAULT NULL, status_activite VARCHAR(255) DEFAULT NULL, compte_valide BOOLEAN DEFAULT false NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B3EC8EBAF2C56620 ON moniteur (compte_id)');
        $this->addSql('CREATE TABLE moniteur_auto_ecole (moniteur_id INT NOT NULL, auto_ecole_id INT NOT NULL, PRIMARY KEY(moniteur_id, auto_ecole_id))');
        $this->addSql('CREATE INDEX IDX_A2254921A234A5D3 ON moniteur_auto_ecole (moniteur_id)');
        $this->addSql('CREATE INDEX IDX_A2254921B1C987E1 ON moniteur_auto_ecole (auto_ecole_id)');
        $this->addSql('CREATE TABLE pays (id INT NOT NULL, code_iso VARCHAR(255) NOT NULL, libelle VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE permis (id INT NOT NULL, code_permis VARCHAR(255) NOT NULL, libelle VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE point (id INT NOT NULL, media_id INT DEFAULT NULL, circuit_id INT DEFAULT NULL, libelle VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, latitude NUMERIC(12, 8) NOT NULL, longitude NUMERIC(12, 8) NOT NULL, type VARCHAR(255) DEFAULT NULL, rang INT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_B7A5F324EA9FDD75 ON point (media_id)');
        $this->addSql('CREATE INDEX IDX_B7A5F324CF2182C8 ON point (circuit_id)');
        $this->addSql('CREATE TABLE ville (id INT NOT NULL, pays_id INT DEFAULT NULL, code VARCHAR(255) NOT NULL, libelle VARCHAR(255) NOT NULL, region VARCHAR(255) DEFAULT NULL, departement VARCHAR(255) DEFAULT NULL, latitude NUMERIC(12, 8) NOT NULL, longitude NUMERIC(12, 8) NOT NULL, code_postal VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_43C3D9C3A6E44244 ON ville (pays_id)');
        $this->addSql('ALTER TABLE auto_ecole ADD CONSTRAINT FK_FD0557A73F0036 FOREIGN KEY (ville_id) REFERENCES ville (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE auto_ecole ADD CONSTRAINT FK_FD0557F2C56620 FOREIGN KEY (compte_id) REFERENCES compte (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE centre_examen ADD CONSTRAINT FK_82F1814BA73F0036 FOREIGN KEY (ville_id) REFERENCES ville (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit ADD CONSTRAINT FK_1325F3A6A1461B2E FOREIGN KEY (ville_centre_id) REFERENCES ville (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit ADD CONSTRAINT FK_1325F3A6BA266824 FOREIGN KEY (id_moniteur_id) REFERENCES moniteur (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit_media ADD CONSTRAINT FK_A949D7CBCF2182C8 FOREIGN KEY (circuit_id) REFERENCES circuit (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit_media ADD CONSTRAINT FK_A949D7CBEA9FDD75 FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit_cours ADD CONSTRAINT FK_3EAFFA5BCF2182C8 FOREIGN KEY (circuit_id) REFERENCES circuit (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit_cours ADD CONSTRAINT FK_3EAFFA5B7ECF78B0 FOREIGN KEY (cours_id) REFERENCES cours (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE compte_langue ADD CONSTRAINT FK_49CE2CB9F2C56620 FOREIGN KEY (compte_id) REFERENCES compte (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE compte_langue ADD CONSTRAINT FK_49CE2CB92AADBACD FOREIGN KEY (langue_id) REFERENCES langue (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE compte_permis ADD CONSTRAINT FK_CDA1CD64F2C56620 FOREIGN KEY (compte_id) REFERENCES compte (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE compte_permis ADD CONSTRAINT FK_CDA1CD643594A24E FOREIGN KEY (permis_id) REFERENCES permis (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE cours ADD CONSTRAINT FK_FDCA8C9CA234A5D3 FOREIGN KEY (moniteur_id) REFERENCES moniteur (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve ADD CONSTRAINT FK_ECA105F7F2C56620 FOREIGN KEY (compte_id) REFERENCES compte (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve ADD CONSTRAINT FK_ECA105F7B1C987E1 FOREIGN KEY (auto_ecole_id) REFERENCES auto_ecole (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve_centre_examen ADD CONSTRAINT FK_F2234D06A6CC7B2 FOREIGN KEY (eleve_id) REFERENCES eleve (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve_centre_examen ADD CONSTRAINT FK_F2234D06F2ACCC13 FOREIGN KEY (centre_examen_id) REFERENCES centre_examen (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve_cours ADD CONSTRAINT FK_E2AA9175A6CC7B2 FOREIGN KEY (eleve_id) REFERENCES eleve (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve_cours ADD CONSTRAINT FK_E2AA91757ECF78B0 FOREIGN KEY (cours_id) REFERENCES cours (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve_circuit ADD CONSTRAINT FK_FF9FC8BAA6CC7B2 FOREIGN KEY (eleve_id) REFERENCES eleve (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE eleve_circuit ADD CONSTRAINT FK_FF9FC8BACF2182C8 FOREIGN KEY (circuit_id) REFERENCES circuit (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE media ADD CONSTRAINT FK_6A2CA10CF2C56620 FOREIGN KEY (compte_id) REFERENCES compte (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE media ADD CONSTRAINT FK_6A2CA10C7ECF78B0 FOREIGN KEY (cours_id) REFERENCES cours (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE media ADD CONSTRAINT FK_6A2CA10CA234A5D3 FOREIGN KEY (moniteur_id) REFERENCES moniteur (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE moniteur ADD CONSTRAINT FK_B3EC8EBAF2C56620 FOREIGN KEY (compte_id) REFERENCES compte (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE moniteur_auto_ecole ADD CONSTRAINT FK_A2254921A234A5D3 FOREIGN KEY (moniteur_id) REFERENCES moniteur (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE moniteur_auto_ecole ADD CONSTRAINT FK_A2254921B1C987E1 FOREIGN KEY (auto_ecole_id) REFERENCES auto_ecole (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE point ADD CONSTRAINT FK_B7A5F324EA9FDD75 FOREIGN KEY (media_id) REFERENCES media (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE point ADD CONSTRAINT FK_B7A5F324CF2182C8 FOREIGN KEY (circuit_id) REFERENCES circuit (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE ville ADD CONSTRAINT FK_43C3D9C3A6E44244 FOREIGN KEY (pays_id) REFERENCES pays (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE auto_ecole_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE centre_examen_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE circuit_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE compte_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE cours_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE eleve_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE langue_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE media_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE moniteur_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE pays_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE permis_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE point_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE ville_id_seq CASCADE');
        $this->addSql('ALTER TABLE auto_ecole DROP CONSTRAINT FK_FD0557A73F0036');
        $this->addSql('ALTER TABLE auto_ecole DROP CONSTRAINT FK_FD0557F2C56620');
        $this->addSql('ALTER TABLE centre_examen DROP CONSTRAINT FK_82F1814BA73F0036');
        $this->addSql('ALTER TABLE circuit DROP CONSTRAINT FK_1325F3A6A1461B2E');
        $this->addSql('ALTER TABLE circuit DROP CONSTRAINT FK_1325F3A6BA266824');
        $this->addSql('ALTER TABLE circuit_media DROP CONSTRAINT FK_A949D7CBCF2182C8');
        $this->addSql('ALTER TABLE circuit_media DROP CONSTRAINT FK_A949D7CBEA9FDD75');
        $this->addSql('ALTER TABLE circuit_cours DROP CONSTRAINT FK_3EAFFA5BCF2182C8');
        $this->addSql('ALTER TABLE circuit_cours DROP CONSTRAINT FK_3EAFFA5B7ECF78B0');
        $this->addSql('ALTER TABLE compte_langue DROP CONSTRAINT FK_49CE2CB9F2C56620');
        $this->addSql('ALTER TABLE compte_langue DROP CONSTRAINT FK_49CE2CB92AADBACD');
        $this->addSql('ALTER TABLE compte_permis DROP CONSTRAINT FK_CDA1CD64F2C56620');
        $this->addSql('ALTER TABLE compte_permis DROP CONSTRAINT FK_CDA1CD643594A24E');
        $this->addSql('ALTER TABLE cours DROP CONSTRAINT FK_FDCA8C9CA234A5D3');
        $this->addSql('ALTER TABLE eleve DROP CONSTRAINT FK_ECA105F7F2C56620');
        $this->addSql('ALTER TABLE eleve DROP CONSTRAINT FK_ECA105F7B1C987E1');
        $this->addSql('ALTER TABLE eleve_centre_examen DROP CONSTRAINT FK_F2234D06A6CC7B2');
        $this->addSql('ALTER TABLE eleve_centre_examen DROP CONSTRAINT FK_F2234D06F2ACCC13');
        $this->addSql('ALTER TABLE eleve_cours DROP CONSTRAINT FK_E2AA9175A6CC7B2');
        $this->addSql('ALTER TABLE eleve_cours DROP CONSTRAINT FK_E2AA91757ECF78B0');
        $this->addSql('ALTER TABLE eleve_circuit DROP CONSTRAINT FK_FF9FC8BAA6CC7B2');
        $this->addSql('ALTER TABLE eleve_circuit DROP CONSTRAINT FK_FF9FC8BACF2182C8');
        $this->addSql('ALTER TABLE media DROP CONSTRAINT FK_6A2CA10CF2C56620');
        $this->addSql('ALTER TABLE media DROP CONSTRAINT FK_6A2CA10C7ECF78B0');
        $this->addSql('ALTER TABLE media DROP CONSTRAINT FK_6A2CA10CA234A5D3');
        $this->addSql('ALTER TABLE moniteur DROP CONSTRAINT FK_B3EC8EBAF2C56620');
        $this->addSql('ALTER TABLE moniteur_auto_ecole DROP CONSTRAINT FK_A2254921A234A5D3');
        $this->addSql('ALTER TABLE moniteur_auto_ecole DROP CONSTRAINT FK_A2254921B1C987E1');
        $this->addSql('ALTER TABLE point DROP CONSTRAINT FK_B7A5F324EA9FDD75');
        $this->addSql('ALTER TABLE point DROP CONSTRAINT FK_B7A5F324CF2182C8');
        $this->addSql('ALTER TABLE ville DROP CONSTRAINT FK_43C3D9C3A6E44244');
        $this->addSql('DROP TABLE auto_ecole');
        $this->addSql('DROP TABLE centre_examen');
        $this->addSql('DROP TABLE circuit');
        $this->addSql('DROP TABLE circuit_media');
        $this->addSql('DROP TABLE circuit_cours');
        $this->addSql('DROP TABLE compte');
        $this->addSql('DROP TABLE compte_langue');
        $this->addSql('DROP TABLE compte_permis');
        $this->addSql('DROP TABLE cours');
        $this->addSql('DROP TABLE eleve');
        $this->addSql('DROP TABLE eleve_centre_examen');
        $this->addSql('DROP TABLE eleve_cours');
        $this->addSql('DROP TABLE eleve_circuit');
        $this->addSql('DROP TABLE langue');
        $this->addSql('DROP TABLE media');
        $this->addSql('DROP TABLE moniteur');
        $this->addSql('DROP TABLE moniteur_auto_ecole');
        $this->addSql('DROP TABLE pays');
        $this->addSql('DROP TABLE permis');
        $this->addSql('DROP TABLE point');
        $this->addSql('DROP TABLE ville');
    }
}
