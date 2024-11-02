<?php

namespace App\Command;

use App\Entity\AutoEcole;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:delete-auto-ecoles',
    description: 'Supprime toutes les auto-écoles de la base de données',
)]
class DeleteAutoEcolesCommand extends Command
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Supprimer toutes les auto-écoles
        $deletedCount = $this->entityManager->createQueryBuilder()
            ->delete(AutoEcole::class, 'a')
            ->getQuery()
            ->execute();

        $io->success("$deletedCount auto-écoles supprimées.");
        return Command::SUCCESS;
    }
}
