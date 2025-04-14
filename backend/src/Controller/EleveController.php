<?php

namespace App\Controller;

use App\Entity\Eleve;
use App\Entity\Compte;
use App\Entity\CentreExamen;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Serializer\SerializerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

#[Route('/api/eleves')]
class EleveController extends AbstractController
{
    private $entityManager;
    private $serializer;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
    }

    #[Route('/{id}/centres-examen-favoris', name: 'get_eleve_centres_examen_favoris', methods: ['GET'])]
    public function getCentresExamenFavoris(int $id): JsonResponse
    {
        $compte = $this->getUser();
        // Récupérer l'élève à partir de l'ID du compte
        $eleve = $this->entityManager->getRepository(Eleve::class)->findOneBy(['compte' => $compte]);
        if (!$eleve) {
            return new JsonResponse(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Récupérer les centres d'examen favoris de l'élève
        $centresFavoris = $eleve->getCentresExemenFavoris();

        if ($centresFavoris->isEmpty()) {
            return new JsonResponse(['message' => 'Aucun centre d\'examen favori trouvé'], JsonResponse::HTTP_OK);
        }
        
        // Créer un tableau simple pour le retour
        $centresArray = [];
        foreach ($centresFavoris as $centre) {
            $centresArray[] = [
                'id' => $centre->getId(),
                'libelle' => $centre->getLibelle(),
                // Ajoutez ici les autres champs nécessaires
            ];
        }
        
        return new JsonResponse($centresArray, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/centres-examen-favoris/{centreId}', name: 'add_centre_examen_favori', methods: ['POST'])]
    public function addCentreExamenFavori(int $id, int $centreId): JsonResponse
    {
        $compte = $this->getUser();
        // Récupérer l'élève à partir de l'ID du compte
        $eleve = $this->entityManager->getRepository(Eleve::class)->findOneBy(['compte' => $compte]);
        if (!$eleve) {
            return new JsonResponse(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
        $centreExamen = $this->getCentreExamen($centreId);
        
        // Vérifier si le centre d'examen est déjà en favori
        if (!$eleve->getCentresExemenFavoris()->contains($centreExamen)) {
            $eleve->addCentresExemenFavori($centreExamen);
            $this->entityManager->flush();
        }
        
        return new JsonResponse(['message' => 'Centre d\'examen ajouté aux favoris'], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/centres-examen-favoris', name: 'replace_centres_examen_favoris', methods: ['PUT'])]
    public function replaceCentresExamenFavoris(int $id, Request $request): JsonResponse
    {
        $compte = $this->getUser();
        // Récupérer l'élève à partir de l'ID du compte
        $eleve = $this->entityManager->getRepository(Eleve::class)->findOneBy(['compte' => $compte]);
        if (!$eleve) {
            return new JsonResponse(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['centreIds']) || !is_array($data['centreIds'])) {
            return new JsonResponse(['error' => 'Le format de la requête est incorrect. Attendu: {"centreIds": [1, 2, 3]}'], JsonResponse::HTTP_BAD_REQUEST);
        }
        
        // Supprimer tous les favoris existants
        foreach ($eleve->getCentresExemenFavoris() as $centre) {
            $eleve->removeCentresExemenFavori($centre);
        }
        
        // Ajouter les nouveaux favoris
        foreach ($data['centreIds'] as $centreId) {
            $centreExamen = $this->getCentreExamen($centreId);
            $eleve->addCentresExemenFavori($centreExamen);
        }
        
        $this->entityManager->flush();
        
        return new JsonResponse(['message' => 'Centres d\'examen favoris mis à jour'], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/info', name: 'eleve_info', methods: ['GET'])]
    public function getStudentInfo(int $id): JsonResponse
    {
        $eleve = $this->entityManager->getRepository(Eleve::class)->findOneBy(['compte' => $id]);

        if (!$eleve) {
            return new JsonResponse(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $compte = $eleve->getCompte();

        $eleveInfo = [
            'nom' => $compte->getNom(),
            'prenom' => $compte->getPrenom(),
            'genre' => $compte->getGenre(),
            'dateNaissance' => $compte->getDateNaissance()?->format('Y-m-d'),
            'email' => $compte->getEmail(),
            'telephone' => $compte->getTelephone(),
            'dateExamen' => $eleve->getDateExamenPratique()?->format('Y-m-d'),
            'autoEcole' => $eleve->getAutoEcole()?->getNom(),
        ];

        return new JsonResponse($eleveInfo, JsonResponse::HTTP_OK);
    }


    #[Route('/UpdateInfo', name: 'eleve_update_info', methods: ['POST'])]
    public function updateStudentInfo(Request $request): JsonResponse
    {
        
        $compte = $this->getUser();

        if (!$compte) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $eleve = $this->entityManager->getRepository(Eleve::class)->findOneBy(['compte' => $compte]);

        if (!$eleve) {
            return new JsonResponse(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        // Mise à jour des infos Compte
        $compte->setNom($data['nom'] ?? $compte->getNom());
        $compte->setPrenom($data['prenom'] ?? $compte->getPrenom());
        $compte->setGenre($data['genre'] ?? $compte->getGenre());
        $compte->setTelephone($data['telephone'] ?? $compte->getTelephone());

        if (!empty($data['dateNaissance'])) {
            $compte->setDateNaissance(new \DateTime($data['dateNaissance']));
        }

        // Mise à jour des infos Élève
        if (!empty($data['dateExamen'])) {
            $eleve->setDateExamen(new \DateTime($data['dateExamen']));
        }

        if (!empty($data['autoEcole'])) {
            $autoEcole = $this->entityManager->getRepository(\App\Entity\AutoEcole::class)
                ->findOneBy(['nom' => $data['autoEcole']]);
            if ($autoEcole) {
                $eleve->setAutoEcole($autoEcole);
            }
        }

        $this->entityManager->flush();

        return new JsonResponse(['success' => true, 'message' => 'Informations de l\'élève mises à jour avec succès'], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/centres-examen-favoris/{centreId}', name: 'remove_centre_examen_favori', methods: ['DELETE'])]
    public function removeCentreExamenFavori(int $id, int $centreId): JsonResponse
    {
        $compte = $this->getUser();
        // Récupérer l'élève à partir de l'ID du compte
        $eleve = $this->entityManager->getRepository(Eleve::class)->findOneBy(['compte' => $compte]);
        if (!$eleve) {
            return new JsonResponse(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
        $centreExamen = $this->getCentreExamen($centreId);
        
        if ($eleve->getCentresExemenFavoris()->contains($centreExamen)) {
            $eleve->removeCentresExemenFavori($centreExamen);
            $this->entityManager->flush();
        }
        
        return new JsonResponse(['message' => 'Centre d\'examen retiré des favoris'], JsonResponse::HTTP_OK);
    }
    

    /**
     * Méthode utilitaire pour récupérer un centre d'examen avec vérification d'existence
     */
    private function getCentreExamen(int $id): CentreExamen
    {
        $centreExamen = $this->entityManager->getRepository(CentreExamen::class)->find($id);
        
        if (!$centreExamen) {
            throw new NotFoundHttpException('Centre d\'examen non trouvé');
        }
        
        return $centreExamen;
    }
}