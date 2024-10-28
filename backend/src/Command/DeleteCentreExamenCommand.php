<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:delete-centre-examen',
    description: 'Supprime toutes les entrées de la table centre_examen',
)]
class DeleteCentreExamenCommand extends Command
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
    }

    protected function configure(): void
    {
        // Configuration additionnelle si nécessaire
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $connection = $this->entityManager->getConnection();
        $sql = 'DELETE FROM centre_examen';

        try {
            $connection->executeStatement($sql);
            $io->success('Toutes les entrées de centre_examen ont été supprimées avec succès.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Une erreur est survenue : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
