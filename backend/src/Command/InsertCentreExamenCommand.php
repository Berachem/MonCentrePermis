<?php

namespace App\Command;

use App\Entity\CentreExamen;
use App\Entity\Ville;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpKernel\KernelInterface;

#[AsCommand(
    name: 'app:insert-centre-examen',
    description: 'Insère les données des centres d’examen depuis un fichier JSON',
)]
class InsertCentreExamenCommand extends Command
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

        // Chemin vers le fichier JSON contenant les centres d'examen
        $jsonFilePath = $this->projectDir .'\data\centres_examens.json';; // Spécifiez le chemin exact du fichier JSON
        $jsonData = json_decode(file_get_contents($jsonFilePath), true);

        if (isset($jsonData['centres_examens'])) {
            $batchSize = 20;
            $index = 0;

            foreach ($jsonData['centres_examens'] as $data) {
                $centre = new CentreExamen();
                $centre->setLibelle($data['name'] ?? '');
            
                // Définit latitude et longitude à 0 si elles sont manquantes
                $latitude = isset($data['lat']) ? (float) $data['lat'] : 0;
                $longitude = isset($data['long']) ? (float) $data['long'] : 0;
            
                $centre->setLatitude((string)$latitude);
                $centre->setLongitude((string)$longitude);
                $centre->setAdresse($data['formattedAddress']['address'] ?? '');
            
                // Associer la ville si elle existe d'abord par code postal, sinon par nom
                $ville = $this->entityManager->getRepository(Ville::class)
                    ->findOneBy(['code_postal' => strtoupper($data['formattedAddress']['cp'] ?? '')]);

                // Si la ville n'est pas trouvée par code postal, recherche par nom
                if (!$ville && isset($data['formattedAddress']['city'])) {
                $ville = $this->entityManager->getRepository(Ville::class)
                    ->findOneBy(['libelle' => strtoupper(str_replace('-', ' ', $data['formattedAddress']['city']))]);
                }

                if ($ville) {
                    $centre->setVille($ville);
                }
                            
                $this->entityManager->persist($centre);
            
                // Flush et clear par lots pour libérer la mémoire
                if (($index % $batchSize) === 0) {
                    $this->entityManager->flush();
                    $this->entityManager->clear();
                }
            
                $index++;
            }
            
            // Flush final
            $this->entityManager->flush();
            
            
            $io->success('Les données des centres d’examen ont été insérées avec succès.');
            return Command::SUCCESS;
        } else {
            $io->error("Les données JSON sont incorrectes ou le fichier est vide.");
            return Command::FAILURE;
        }
    }
}
