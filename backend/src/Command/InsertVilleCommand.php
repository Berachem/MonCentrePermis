<?php

namespace App\Command;

use App\Entity\Ville;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Exception\FileNotFoundException;
use Symfony\Component\HttpKernel\KernelInterface;

#[AsCommand(
    name: 'app:insert-ville-data',
    description: 'Insère des données de villes depuis un fichier JSON dans la base de données',
)]
class InsertVilleCommand extends Command
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
        $this->setDescription('Insère des données de villes depuis un fichier JSON dans la base de données');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filePath = $this->projectDir . '\data\ville_fr.json'; // Changez le chemin si nécessaire

        if (!file_exists($filePath)) {
            throw new FileNotFoundException("Le fichier $filePath est introuvable.");
        }

        // Lecture et décodage des données JSON
        $jsonData = file_get_contents($filePath);
        $data = json_decode($jsonData, true);

        if ($data === null) {
            $io->error('Erreur lors de la lecture du fichier JSON.');
            return Command::FAILURE;
        }
        ini_set('memory_limit', '1024M');

        foreach ($data['cities'] as $index => $record) {
            $ville = new Ville();
            $ville->setCode($record['city_code']);
            $ville->setLibelle(strtoupper($record['label']));
            $ville->setCodePostal($record['zip_code']);
            $ville->setLatitude($record['latitude'] !== '' ? $record['latitude'] : '0');
            $ville->setLongitude($record['longitude'] !== '' ? $record['longitude'] : '0');            
            $ville->setDepartement($record['department_name']);
            $ville->setRegion($record['region_name']);
            // Remplissez les autres propriétés si nécessaire

            $this->entityManager->persist($ville);

            if (($index + 1) % 20 === 0) {
                $this->entityManager->flush();
                $this->entityManager->clear(); // Libère la mémoire en vidant l'EntityManager
            }
        }

        $this->entityManager->flush();
        $io->success('Données de villes insérées avec succès depuis le fichier JSON.');

        return Command::SUCCESS;
    }
}
