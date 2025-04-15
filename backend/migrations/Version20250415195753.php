<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250415195753 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Mise à null de la ville et du code postal du centre d\'examen de Bangor';
    }

    public function up(Schema $schema): void
    {
        // Utilisation de paramètres préparés pour éviter les injections SQL
        $centreExamen = $this->connection->fetchAssociative(
            'SELECT * FROM centre_examen WHERE libelle = :libelle', 
            ['libelle' => 'Bangor MPTC Test Centre']
        );
        
        if (!$centreExamen) {
            $this->write('Centre d\'examen "Bangor MPTC Test Centre" non trouvé, aucune modification effectuée.');
            return;
        }
        
        try {
            $this->connection->beginTransaction();
            
            // Mettre ville et code postal à null
            $this->connection->update(
                'centre_examen',
                [
                    'ville' => null,
                    'code_postal' => null,
                ],
                ['id' => $centreExamen['id']]
            );
            
            $this->connection->commit();
            $this->write('Ville et code postal du centre d\'examen de Bangor mis à null avec succès.');
        }
        catch (\Exception $e) {
            $this->connection->rollBack();
            throw new \RuntimeException('Erreur lors de la mise à jour du centre d\'examen de Bangor : ' . $e->getMessage());
        }
    }

    public function down(Schema $schema): void
    {
        
    }
}
