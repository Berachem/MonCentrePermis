<?php

namespace App\Command;

use App\Entity\AutoEcole;
use App\Entity\Ville;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpKernel\KernelInterface;

#[AsCommand(
    name: 'app:insert-auto-ecoles',
    description: 'Insère les données des auto-écoles depuis un fichier JSON',
)]
class InsertAutoEcolesCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private string $projectDir;

    public function __construct(EntityManagerInterface $entityManager, KernelInterface $kernel)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->projectDir = $kernel->getProjectDir(); // Utilisation de KernelInterface pour récupérer le projectDir
    }

    protected function configure(): void
    {
        // Configurations supplémentaires si nécessaire
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Chemin vers le fichier JSON contenant les auto-écoles
        $jsonFilePath = $this->projectDir . '\data\auto_ecoles.json';
        $jsonData = json_decode(file_get_contents($jsonFilePath), true);
        ini_set('memory_limit', '512M'); // ou même '1G' pour 1 Go


        if (isset($jsonData)) {
            $batchSize = 20;
            $i = 0;
            
            foreach ($jsonData as $data) {
                if (isset($data['num_agrement']) && is_string($data['num_agrement'])) {
                    $autoEcole = new AutoEcole();
                    
                    $autoEcole->setNumeroAgrement($data['num_agrement']);
                    $adresse = $data['address'] ?? null;
                    $autoEcole->setAdresse($adresse);
            
                    if (isset($data['city']) && is_string($data['city'])) {
                        // Associer la ville si elle existe d'abord par code postal, sinon par nom
                        $ville = $this->entityManager->getRepository(Ville::class)
                        ->findOneBy(['code_postal' => strtoupper((string) ($data['cp'] ?? ''))]);

                        // Si la ville n'est pas trouvée par code postal, recherche par nom
                        if (!$ville && isset($data['formattedAddress']['city'])) {
                        $ville = $this->entityManager->getRepository(Ville::class)
                            ->findOneBy(['libelle' => strtoupper(str_replace('-', ' ', $data['city']))]);
                        }

                        if ($ville) {
                            $autoEcole->setVille($ville);
                        } else {
                            $io->warning("Ville non trouvée : " . strtoupper(str_replace('-', ' ', $data['city'])));
                        }
                    }
            
                    $this->entityManager->persist($autoEcole);
            
                    // Vider périodiquement l'EntityManager pour libérer la mémoire
                    if (($i % $batchSize) === 0) {
                        $this->entityManager->flush();
                        $this->entityManager->clear();
                    }
            
                    $i++;
                } 
                // else {
                    // $io->warning("Enregistrement ignoré : numéro d'agrément manquant ou invalide pour : " . json_encode($data));
                // }
            }
            
            // Dernière opération flush pour les données restantes
            $this->entityManager->flush();
            $this->entityManager->clear();
            
            $io->success('Les données des auto-écoles ont été insérées avec succès.');
            
            
            return Command::SUCCESS;
        } else {
            $io->error("Les données JSON sont incorrectes ou le fichier est vide.");
            return Command::FAILURE;
        }
    }
}
