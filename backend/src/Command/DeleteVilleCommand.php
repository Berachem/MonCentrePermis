<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:delete-ville',
    description: 'Supprime toutes les entrées de la table ville',
)]
class DeleteVilleCommand extends Command
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
    }

    protected function configure(): void
    {
        // Vous pouvez ajouter des options supplémentaires ici si nécessaire
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Utilisation d'une requête SQL brute pour supprimer toutes les villes
        $connection = $this->entityManager->getConnection();
        $sql = 'DELETE FROM ville';
        
        try {
            $connection->executeStatement($sql);
            $io->success('Toutes les villes ont été supprimées avec succès.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Une erreur est survenue : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
