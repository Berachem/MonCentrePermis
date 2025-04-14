<?php

namespace App\Controller;

use App\Entity\Moniteur;
use App\Entity\Compte;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

#[Route('/api/moniteurs')]
class MoniteurController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(
        EntityManagerInterface $entityManager
    ) {
        $this->entityManager = $entityManager;
    }

    #[Route('/{id}/info', name: 'moniteur_info', methods: ['GET'])]
    public function getMoniteurInfo(int $id): JsonResponse
    {
        $moniteur = $this->entityManager->getRepository(Moniteur::class)->findOneBy(['compte' => $id]);

        if (!$moniteur) {
            return new JsonResponse(['error' => 'Moniteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $compte = $moniteur->getCompte();

        $moniteurInfo = [
            // Infos
            'nom' => $compte->getNom(),
            'prenom' => $compte->getPrenom(),
            'genre' => $compte->getGenre(), // Assure-toi que la méthode existe
            'dateNaissance' => $compte->getDateNaissance()?->format('Y-m-d'),
            'email' => $compte->getEmail(),
            'telephone' => $compte->getTelephone(),
            'dateDebutCarriere' => $moniteur->getDateDebutCarriere()?->format('Y-m-d'),
            'status' => $moniteur->getStatusActivite(),

            // Stats (à adapter selon la logique métier que tu mettras plus tard)
            'coursesCount' => '0',
            'studentCount' => '0',
            'viewCount' => '0',
            'rating' => '0.0',
        ];

        return new JsonResponse($moniteurInfo, JsonResponse::HTTP_OK);
    }


    #[Route('/UpdateInfo', name: 'moniteur_update_info', methods: ['POST'])]
    public function updateMoniteurInfo(Request $request): JsonResponse
{
    /** @var Compte|null $compte */
    $compte = $this->getUser();

    if (!$compte) {
        return new JsonResponse(['error' => 'Utilisateur non authentifié'], JsonResponse::HTTP_UNAUTHORIZED);
    }

    $moniteur = $compte->getMoniteur();

    if (!$moniteur) {
        return new JsonResponse(['error' => 'Moniteur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
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

    // Mise à jour des infos Moniteur
    if (!empty($data['dateDebutCarriere'])) {
        $moniteur->setDateDebutCarriere(new \DateTime($data['dateDebutCarriere']));
    }

    $moniteur->setStatusActivite($data['status'] ?? $moniteur->getStatusActivite());

    $this->entityManager->flush();

    return new JsonResponse(['success' => true, 'message' => 'Informations mises à jour avec succès'], JsonResponse::HTTP_OK);
}

}
