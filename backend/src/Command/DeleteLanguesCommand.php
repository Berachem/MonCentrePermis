<?php

namespace App\Command;

use App\Entity\Langue; // Import de la classe Langue
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:delete-langues',
    description: 'Supprime toutes les entrées de la table langues',
)]
class DeleteLanguesCommand extends Command
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

        // Suppression de toutes les langues
        $langueRepository = $this->entityManager->getRepository(Langue::class);
        $langueList = $langueRepository->findAll();

        foreach ($langueList as $langue) {
            $this->entityManager->remove($langue);
        }

        $this->entityManager->flush();

        $io->success('Toutes les langues ont été supprimées avec succès.');

        return Command::SUCCESS;
    }
}
