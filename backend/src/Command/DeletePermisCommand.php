<?php

namespace App\Command;

use App\Entity\Permis;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:delete-permis',
    description: 'Supprime tous les permis de la base de données',
)]
class DeletePermisCommand extends Command
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
    }

    protected function configure(): void
    {
        // Pas d'options nécessaires
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Suppression de tous les permis avec un alias
        $this->entityManager->createQueryBuilder()
            ->delete(Permis::class, 'p') // Ajout de l'alias 'p' pour Permis
            ->getQuery()
            ->execute();

        $io->success('Tous les permis ont été supprimés.');
        return Command::SUCCESS;
    }
}
