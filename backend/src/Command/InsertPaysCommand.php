<?php

namespace App\Command;

use App\Entity\Pays;
use App\Entity\Ville;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Exception\FileNotFoundException;
use Symfony\Component\HttpKernel\KernelInterface; // Import du KernelInterface

#[AsCommand(
    name: 'app:insert-pays-data',
    description: 'Insère des données de pays et de villes depuis un fichier JSON dans la base de données',
)]
class InsertPaysCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private string $projectDir; // Déclaration de la propriété projectDir

    public function __construct(EntityManagerInterface $entityManager, KernelInterface $kernel)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->projectDir = $kernel->getProjectDir(); // Initialisation de projectDir
    }

    protected function configure(): void
    {
        $this->setDescription('Insère des données de pays et de villes depuis un fichier JSON dans la base de données');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
    
        // Utilisation de projectDir pour le chemin du fichier JSON
        $filePath = $this->projectDir . '\data\pays.json';
    
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
    
        foreach ($data as $record) {
            $pays = $this->entityManager->getRepository(Pays::class)->findOneBy(['code_iso' => $record['alpha3']]);
            if (!$pays) {
                $pays = new Pays();
                $pays->setCodeIso(strtoupper($record['alpha3']));
                $pays->setLibelle($record['name']);
                
                // Persist the country object
                $this->entityManager->persist($pays);
            }
        }
        
        // Flush all changes to the database
        $this->entityManager->flush();
        
        // Print the IDs of the newly inserted countries
        foreach ($data as $record) {
            $pays = $this->entityManager->getRepository(Pays::class)->findOneBy(['code_iso' => $record['alpha3']]);
            if ($pays) {
                $io->note(sprintf("Inserted Pays: ID=%d, Code ISO=%s, Libellé=%s", $pays->getId(), $pays->getCodeIso(), $pays->getLibelle()));
            }
        }
    
        $io->success('Données de pays et de villes insérées avec succès depuis le fichier JSON.');
    
        return Command::SUCCESS;
    }
    
}
