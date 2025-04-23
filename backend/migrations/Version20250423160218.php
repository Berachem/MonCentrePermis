<?php

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class VersionXYZ extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Recréation manuelle de la table circuit_cours';
    }

    public function up(Schema $schema): void
    {
        // Supprimer la table si elle existe
        $this->addSql('DROP TABLE IF EXISTS circuit_cours CASCADE');
        
        // Créer la table
        $this->addSql('CREATE TABLE circuit_cours (
            id SERIAL PRIMARY KEY,
            circuit_id INT NOT NULL,
            cours_id INT NOT NULL,
            CONSTRAINT fk_circuit FOREIGN KEY (circuit_id) REFERENCES circuit (id),
            CONSTRAINT fk_cours FOREIGN KEY (cours_id) REFERENCES cours (id),
            CONSTRAINT unique_circuit_cours UNIQUE (circuit_id, cours_id)
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE circuit_cours CASCADE');
    }
}