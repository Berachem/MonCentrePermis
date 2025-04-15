<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250414202500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE circuit ADD id_moniteur_id INT NOT NULL');
        $this->addSql('ALTER TABLE circuit ADD CONSTRAINT FK_1325F3A6BA266824 FOREIGN KEY (id_moniteur_id) REFERENCES moniteur (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1325F3A6BA266824 ON circuit (id_moniteur_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE circuit DROP CONSTRAINT FK_1325F3A6BA266824');
        $this->addSql('DROP INDEX IDX_1325F3A6BA266824');
        $this->addSql('ALTER TABLE circuit DROP id_moniteur_id');
    }
}
