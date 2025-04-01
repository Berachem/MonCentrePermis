<?php

namespace App\Controller;

use App\DTO\CreateCompteDTO;
use App\Entity\Compte;
use App\Entity\Moniteur;
use App\Entity\Eleve;
use App\Entity\AutoEcole;
use App\Repository\AutoEcoleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;



#[Route('/api/custom/create-compte')]
class CompteController extends AbstractController
{
    private $autoEcoleRepository;
    private $entityManager;
    private $jwtManager;

    public function __construct(
        EntityManagerInterface $entityManager,
        AutoEcoleRepository $autoEcoleRepository,
        JWTTokenManagerInterface $jwtManager
    ) 
    {
        $this->entityManager = $entityManager;
        $this->autoEcoleRepository = $autoEcoleRepository;
        $this->jwtManager = $jwtManager;
    }

    #[Route('', name: 'create_compte', methods: ['POST'])]
    public function createCompte(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $passwordHasher,
        SerializerInterface $serializer
    ): JsonResponse {
        // Désérialiser les données de la requête dans le DTO
        $dto = $serializer->deserialize($request->getContent(), CreateCompteDTO::class, 'json');

        // Validation des données
        $errors = $validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Créer et configurer l'entité Compte
        $compte = new Compte();
        $compte->setEmail($dto->email);
        $compte->setPassword($passwordHasher->hashPassword($compte, $dto->password));
        $compte->setRaisonSociale($dto->raisonSociale);
        $compte->setNom($dto->nom);
        $compte->setPrenom($dto->prenom);
        $compte->setTelephone($dto->telephone);
        $compte->setBiographie($dto->biographie);
        $compte->setPhotoProfil($dto->photoProfil);
        $compte->setGenre($dto->genre);
        $compte->setDateNaissance(new \DateTime($dto->dateNaissance));
        $compte->setNoteMoyenne($dto->noteMoyenne);

        // Récupérer le rôle
        $role = $dto->role; // Le rôle doit être dans le DTO ou dans la requête

        // Initialisation de l'entité spécifique en fonction du rôle
        if ($role === 'eleve') {
            // Créer un élève et l'associer au compte et à l'auto-école
            $compte->setRoles(['ROLE_ELEVE']);
            $em->persist($compte);
            $em->flush();
            $eleve = new Eleve();
            $eleve->setCompte($compte);
            $eleve->setDateExamenPratique($dto->dateExamen);
            // Sauvegarder l'élève
            $em->persist($eleve);
        } elseif ($role === 'moniteur') {
            // Créer un moniteur et l'associer au compte
            $compte->setRoles(['ROLE_MONITEUR']);
            $em->persist($compte);
            $em->flush();
            $moniteur = new Moniteur();
            $moniteur->setCompte($compte);
            $moniteur->setCompteValide($dto->compteValide ?? false);
            if (!empty($dto->date_debut_carriere)) {
                $moniteur->setDateDebutCarriere(new \DateTime($dto->dateDebutCarriere));
            }
            $moniteur->setStatusActivite($dto->statusActivite);
            $moniteur->setNumeroCertification($dto->NumeroCertification);

            // Sauvegarder le moniteur
            $em->persist($moniteur);
        } elseif ($role === 'autoecole') {
            // Créer une auto-école et l'associer au compte
            $autoEcole = new AutoEcole();
            $autoEcole->setCompte($compte);
            $autoEcole->setLibelle($dto->libelle); // Assurez-vous que le DTO a bien ce champ

            // Sauvegarder l'auto-école
            $em->persist($autoEcole);
        } else {
            return new JsonResponse(['error' => 'Rôle invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Sauvegarder toutes les entités dans la base de données
        $em->flush();

        // Générer un JWT pour l'utilisateur
        $token = $this->jwtManager->create($compte);

        return new JsonResponse(['message' => 'Inscription réussie', 'token' => $token], 200);
    }
}
