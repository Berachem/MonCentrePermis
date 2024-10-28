<?php

namespace App\Command;

use App\Entity\Permis;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpKernel\KernelInterface;

#[AsCommand(
    name: 'app:insert-permis',
    description: 'Insère les données des permis depuis un fichier JSON',
)]
class InsertPermisCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private string $projectDir;

    public function __construct(EntityManagerInterface $entityManager, KernelInterface $kernel)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->projectDir = $kernel->getProjectDir();
    }

    protected function configure(): void
    {
        // Configurations supplémentaires si nécessaire
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Chemin vers le fichier JSON contenant les permis
        $jsonFilePath = $this->projectDir . '/data/permis.json';
        $jsonData = json_decode(file_get_contents($jsonFilePath), true);

        if (isset($jsonData)) {
            foreach ($jsonData as $data) {
                $permis = new Permis();
                $permis->setCodePermis($data['code_permis']);
                $permis->setLibelle($data['libelle']);

                $this->entityManager->persist($permis);
            }

            $this->entityManager->flush();
            $io->success('Les données des permis ont été insérées avec succès.');
            return Command::SUCCESS;
        } else {
            $io->error("Les données JSON sont incorrectes ou le fichier est vide.");
            return Command::FAILURE;
        }
    }
}
