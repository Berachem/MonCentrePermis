<?php

namespace App\Command;

use App\Entity\Ville;
use App\Entity\Pays;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Exception\FileNotFoundException;
use Symfony\Component\HttpKernel\KernelInterface;

#[AsCommand(
    name: 'app:insert-ville-en-data',
    description: 'Insère des données de villes anglaises depuis un fichier JSON dans la base de données',
)]
class InsertVilleENCommand extends Command
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
        $this->setDescription('Insère des données de villes anglaises depuis un fichier JSON dans la base de données');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filePath = $this->projectDir . '/data/ville_en.json';

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

        // Recherche ou création du pays Royaume-Uni
        $pays = $this->entityManager->getRepository(Pays::class)->findOneBy(['code_iso' => 'GBR']);
        if (!$pays) {
            $io->error("Le pays avec le code ISO 'GBR' est introuvable. Veuillez l'ajouter d'abord.");
            return Command::FAILURE;
        }

        // Liste pour stocker les villes déjà insérées
        $insertedCities = [];

        foreach ($data as $record) {
            $libelle = strtoupper($record['city']);
            $region = strtoupper($record['region']);
            
            // Vérifier si la ville a déjà été insérée en vérifiant la liste $insertedCities
            if (isset($insertedCities[$libelle . '_' . $region])) {
                // echo "Ville déjà existante dans la liste : $libelle (Région : $region)\n";
                continue;
            }

            // Ajouter la ville à la base de données
            $ville = new Ville();
            $ville->setCode('');
            $ville->setLibelle($libelle);
            $ville->setLatitude($record['lat'] ?? null);
            $ville->setLongitude($record['lng'] ?? null);
            $ville->setRegion($region);
            $ville->setPays($pays);

            $this->entityManager->persist($ville);

            // Ajouter la ville à la liste des villes insérées
            $insertedCities[$libelle . '_' . $region] = true;
        }

        $this->entityManager->flush();
        $io->success('Données de villes anglaises insérées avec succès depuis le fichier JSON.');

        return Command::SUCCESS;
    }
}
