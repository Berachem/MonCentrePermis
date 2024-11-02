<?php

namespace App\Command;

use App\Entity\Pays; // Ajoutez cette ligne pour importer la classe Pays
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:delete-pays',
    description: 'Supprime toutes les entrées de la table pays',
)]
class DeletePaysCommand extends Command
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

        // Suppression de tous les pays
        $paysRepository = $this->entityManager->getRepository(Pays::class);
        $paysList = $paysRepository->findAll();

        foreach ($paysList as $pays) {
            $this->entityManager->remove($pays);
        }

        $this->entityManager->flush();

        $io->success('Tous les pays ont été supprimés avec succès.');

        return Command::SUCCESS;
    }
}
