<?php

namespace App\Command;

use App\Entity\Langue;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Exception\FileNotFoundException;
use Symfony\Component\HttpKernel\KernelInterface;

#[AsCommand(
    name: 'app:insert-langues',
    description: 'Insère des langues depuis un fichier JSON dans la base de données',
)]
class InsertLanguesCommand extends Command
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
        $this->setDescription('Insère des langues depuis un fichier JSON dans la base de données');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        // Chemin vers le fichier JSON en utilisant projectDir
        $filePath = $this->projectDir . '/data/langues.json';
        
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

        foreach ($data as $langueData) {
            // Vérification si la langue existe déjà pour éviter les doublons
            $langue = $this->entityManager->getRepository(Langue::class)->findOneBy(['code_iso' => $langueData['code']]);
            
            if (!$langue) {
                $langue = new Langue();
                $langue->setCodeIso($langueData['code']);
                $langue->setLibelle($langueData['nom']);
                
                $this->entityManager->persist($langue);
            }
        }

        // Sauvegarde des nouvelles entités en base de données
        $this->entityManager->flush();

        // Confirmation de l’insertion
        $io->success('Les langues ont été insérées avec succès depuis le fichier JSON.');

        return Command::SUCCESS;
    }
}
