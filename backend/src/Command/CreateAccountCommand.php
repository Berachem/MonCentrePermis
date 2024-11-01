<?php

namespace App\Command;

use App\Entity\Compte;
use Doctrine\ORM\EntityManagerInterface; // Assurez-vous d'importer la bonne classe
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-account',
    description: 'Add a short description for your command',
)]
class CreateAccountCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    protected function configure()
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'The email of the account')
            ->addArgument('password', InputArgument::REQUIRED, 'The password of the account');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int // <-- Assurez-vous que c'est bien : int ici
    {
        $email = $input->getArgument('email');
        $plainPassword = $input->getArgument('password');

        // Créez une nouvelle instance de Compte
        $account = new Compte();
        $account->setEmail($email);
        $account->setRoles(['ROLE_USER']); // Assurez-vous que le compte a au moins un rôle

        // Hachez le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($account, $plainPassword);
        $account->setPassword($hashedPassword);

        // Persistez l'entité dans la base de données
        $this->entityManager->persist($account);
        $this->entityManager->flush();

        $output->writeln('Account created successfully!');

        return Command::SUCCESS; // Retourne un statut de succès
    }
}