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
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\Regex;



#[Route('/api/compte')]
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


    #[Route('/{id}/description', name: 'compte_description', methods: ['GET'])]
    public function getDescription(int $id): JsonResponse
    {
        $compte = $this->entityManager->getRepository(Compte::class)->find($id);
    
        if (!$compte) {
            return new JsonResponse(['error' => 'Compte non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $description = $compte->getBiographie();
    
        if (!$description) {
            return new JsonResponse(['message' => 'Aucune description disponible pour ce compte.'], JsonResponse::HTTP_OK);
        }
    
        return new JsonResponse(['description' => $description], JsonResponse::HTTP_OK);
    }
    
    #[Route('/{id}/info', name: 'compte_info', methods: ['GET'])]
public function getUserInfo(int $id): JsonResponse
{
    $compte = $this->entityManager->getRepository(Compte::class)->find($id);

    if (!$compte) {
        return new JsonResponse(['error' => 'Compte non trouvé'], JsonResponse::HTTP_NOT_FOUND);
    }

    // Déterminer le type de compte
    $typeCompte = null;
    if ($compte->getMoniteur()) {
        $typeCompte = 'moniteur';
    } elseif ($compte->getEleve()) {
        $typeCompte = 'eleve';
    } else {
        $typeCompte = 'visitor';
    }

    // Construction des infos publiques
    $userInfo = [
        'id' => $compte->getId(),
        'nom' => $compte->getNom(),
        'prenom' => $compte->getPrenom(),
        'email' => $compte->getEmail(),
        'telephone' => $compte->getTelephone(),
        'biographie' => $compte->getBiographie(),
        'photo_profil' => $compte->getPhotoProfil(),
        'note_moyenne' => $compte->getNoteMoyenne(),
        'date_naissance' => $compte->getDateNaissance()?->format('Y-m-d'),
        'genre' => $compte->getGenre(),
        'langues' => array_map(fn($langue) => $langue->getNom(), $compte->getLangues()->toArray()),
        'permis' => array_map(fn($permis) => $permis->getNom(), $compte->getPermis()->toArray()),
        'auto_ecole' => $compte->getAutoEcole()?->getNom(),
        'centres_examen_favoris' => $compte->getEleve()
            ? array_map(fn($centre) => $centre->getNom(), $compte->getEleve()->getCentresExemenFavoris()->toArray())
            : [],
        'cours_favoris' => $compte->getEleve()
            ? array_map(fn($cours) => $cours->getNom(), $compte->getEleve()->getCoursFavoris()->toArray())
            : [],
        'circuits_favoris' => $compte->getEleve()
            ? array_map(fn($circuit) => $circuit->getNom(), $compte->getEleve()->getCircuitsFavoris()->toArray())
            : [],
        'type_compte' => $typeCompte,
    ];

    return new JsonResponse($userInfo, JsonResponse::HTTP_OK);
}
    
    

    #[Route('/updateDescription', name: 'update_user_description', methods: ['POST'])]
    public function updateUserDescription(Request $request): JsonResponse
    {
        $compte = $this->getUser();
    
        if (!$compte) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
        }
    
        $data = json_decode($request->getContent(), true);
        $newDescription = $data['biographie'] ?? null;
    
        if (empty($newDescription)) {
            return new JsonResponse(['error' => 'La description ne peut pas être vide'], JsonResponse::HTTP_BAD_REQUEST);
        }
    
        $compte->setBiographie($newDescription);
        $this->entityManager->flush();
    
        return new JsonResponse(['message' => 'Description mise à jour avec succès'], JsonResponse::HTTP_OK);
    }
    

    #[Route('/create-compte', name: 'create_compte', methods: ['POST'])]
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
            return $this->json(['violations' => $errors], 400);
        }

        // Vérification du mot de passe 
        $passwordConstraints = [
            new NotBlank(),
            new Length(exactly: ['min' => 12]),
            new Regex([
                'pattern' => '/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_])/',
                'message' => 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial.'
            ])
        ];

        $passwordViolations = $validator->validate($dto->password, $passwordConstraints);
        if (count($passwordViolations) > 0) {
            $errors = [];
            foreach ($passwordViolations as $violation) {
                $errors[] = [
                    'propertyPath' => 'password',
                    'message' => $violation->getMessage()
                ];
            }

            return $this->json(['violations' => $errors], 400);
        }

        // Verifier si le mail n'est pas vide
        if (empty($dto->email)) {
            return $this->json([
                'violations' => [
                    ['propertyPath' => 'email', 'message' => 'L\'email ne doit pas être vide.']
                ]
            ], 400);
        }
        // Vérifier si l'email existe déjà, si oui renvoyer une erreur
        $existingCompte = $em->getRepository(Compte::class)->findOneBy(['email' => $dto->email]);
        if ($existingCompte) {
            return $this->json([
                'violations' => [
                    ['propertyPath' => 'email', 'message' => 'Cet email est déjà utilisé.']
                ]
            ], 400);
        }
        // Verifier si le nom n'est pas vide
        if (empty($dto->nom)) {
            return $this->json([
                'violations' => [
                    ['propertyPath' => 'nom', 'message' => 'Le nom ne doit pas être vide.']
                ]
            ], 400);
        }
        // Vérifier si le prénom n'est pas vide
        if (empty($dto->prenom)) {
            return $this->json([
                'violations' => [
                    ['propertyPath' => 'prenom', 'message' => 'Le prénom ne doit pas être vide.']
                ]
            ], 400);
        }
        // Vérifier si le numéro de téléphone est valide
        // Si il est vide passer à la suite
        if (!empty($dto->telephone)) {
            if (!preg_match('/^\+?[0-9]{10,15}$/', $dto->telephone)) {
                return $this->json([
                    'violations' => [
                        ['propertyPath' => 'telephone', 'message' => 'Le numéro de téléphone est invalide.']
                    ]
                ], 400);
            }
            // Vérifier si le numéro de téléphone existe déjà, si oui renvoyer une erreur
            $existingCompteByPhone = $em->getRepository(Compte::class)->findOneBy(['telephone' => $dto->telephone]);
            if ($existingCompteByPhone) {
                return $this->json([
                    'violations' => [
                        ['propertyPath' => 'telephone', 'message' => 'Ce numéro de téléphone est déjà utilisé.']
                    ]
                ], 400);
            }
        }
        
        // Le genre doit être "Homme" ou "Femme" ou "Autre"
        if (!in_array($dto->genre, ['H', 'F', 'A'])) {
            return $this->json([
                'violations' => [
                    ['propertyPath' => 'genre', 'message' => 'Le genre doit être "Homme", "Femme" ou "Autre".']
                ]
            ], 400);
        }
        // Verifier si le rôle n'est pas vide
        if (empty($dto->role)) {
            return $this->json([
                'violations' => [
                    ['propertyPath' => 'role', 'message' => 'Le rôle ne doit pas être vide.']
                ]
            ], 400);
        }
        // Vérifier si le rôle est valide
        if (!in_array($dto->role, ['eleve', 'moniteur', 'autoecole'])) {
            return $this->json([
                'violations' => [
                    ['propertyPath' => 'role', 'message' => 'Le rôle doit être "eleve", "moniteur" ou "autoecole".']
                ]
            ], 400);
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

        $em->persist($compte);

        $role = $dto->role; // Le rôle doit être dans le DTO ou dans la requête

        // Initialisation de l'entité spécifique en fonction du rôle
        if ($role === 'eleve') {
            // Créer un élève et l'associer au compte et à l'auto-école
            $compte->setRoles(['ROLE_ELEVE']);
            $eleve = new Eleve();
            $eleve->setCompte($compte);
            $eleve->setDateExamenPratique($dto->dateExamen);
            // Sauvegarder l'élève
            $em->persist($eleve);
            $compte->setEleve($eleve);
        } elseif ($role === 'moniteur') {
            // Créer un moniteur et l'associer au compte
            $compte->setRoles(['ROLE_MONITEUR']);
            $moniteur = new Moniteur();
            $moniteur->setCompte($compte);
            $moniteur->setCompteValide($dto->compteValide ?? false);
            if (!empty($dto->date_debut_carriere)) {
                $moniteur->setDateDebutCarriere(new \DateTime($dto->dateDebutCarriere));
            }
            $moniteur->setStatusActivite($dto->statusActivite);

            // Assurez-vous que le DTO a bien ce champ et qu'il n'est pas vide
            if (empty($dto->numeroCertification)) {
                return $this->json([
                    'violations' => [
                        ['propertyPath' => 'numeroCertification', 'message' => 'Le numéro de certification ne doit pas être vide.']
                    ]
                ], 400);
            }

            // Vérifier si le numéro de certification est valide
            if (!preg_match('/^[0-9]{10}$/', $dto->numeroCertification)) {
                return $this->json([
                    'violations' => [
                        ['propertyPath' => 'numeroCertification', 'message' => 'Le numéro de certification doit contenir 10 chiffres.']
                    ]
                ], 400);
            }

            // Vérifier si le numéro de certification existe déjà, si oui renvoyer une erreur
            $existingMoniteur = $em->getRepository(Moniteur::class)->findOneBy(['numero_certification' => $dto->numeroCertification]);
            if ($existingMoniteur) {
                return $this->json([
                    'violations' => [
                        ['propertyPath' => 'numeroCertification', 'message' => 'Ce numéro de certification est déjà utilisé.']
                    ]
                ], status: 400);
            }

            $moniteur->setNumeroCertification($dto->NumeroCertification);

            // Sauvegarder le moniteur
            $em->persist($moniteur);
            $compte->setMoniteur($moniteur);
        } elseif ($role === 'autoecole') {
            // Créer une auto-école et l'associer au compte
            $compte->setRoles(['ROLE_AUTO_ECOLE']);
            $autoEcole = new AutoEcole();
            $autoEcole->setCompte($compte);
            $autoEcole->setLibelle($dto->libelle); // Assurez-vous que le DTO a bien ce champ

            // Sauvegarder l'auto-école
            $em->persist($autoEcole);
            $compte->setAutoEcole($autoEcole);
        } else {
            return $this->json([], 400);
        }

        // Sauvegarder toutes les entités dans la base de données
        $em->flush();

        // Générer un JWT pour l'utilisateur
        $token = $this->jwtManager->create($compte);

        return new JsonResponse(['message' => 'Inscription réussie', 'token' => $token], 200);
    }
}
