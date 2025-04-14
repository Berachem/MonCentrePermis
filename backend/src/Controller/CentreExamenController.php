<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\Circuit;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\CentreExamenRepository;
use App\Entity\CentreExamen;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/custom/centre_examens')]
class CentreExamenController extends AbstractController
{

    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('', name: 'api_centres_examen_list', methods: ['GET'])]
    public function list(CentreExamenRepository $repository): JsonResponse
    {
        // Récupérer tous les centres d'examen
        $centresExamen = $repository->findAll();

        // Construire la réponse avec les données de la ville intégrées
        $responseData = array_map(function ($centreExamen) {
            $ville = $centreExamen->getVille();

            return [
                'id' => $centreExamen->getId(),
                'libelle' => $centreExamen->getLibelle(),
                'adresse' => $centreExamen->getAdresse(),
                'latitude' => $centreExamen->getLatitude(),
                'longitude' => $centreExamen->getLongitude(),
                'ville' => $ville ? [
                    'id' => $ville->getId(),
                    'code' => $ville->getCode(),
                    'libelle' => $ville->getLibelle(),
                    'region' => $ville->getRegion(),
                    'departement' => $ville->getDepartement(),
                    'latitude' => $ville->getLatitude(),
                    'longitude' => $ville->getLongitude(),
                    'code_postal' => $ville->getCodePostal(),
                    'createdAt' => $ville->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updatedAt' => $ville->getUpdatedAt()->format('Y-m-d H:i:s'),
                ] : null,
                'pays' => $ville ? $ville->getPays()->getLibelle() : null,
                'createdAt' => $centreExamen->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $centreExamen->getUpdatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $centresExamen);

        return new JsonResponse($responseData, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_centre_examen_show', methods: ['GET'])]
    public function show(int $id, CentreExamenRepository $repository): JsonResponse
    {
        // Récupérer le centre d'examen par ID
        $centreExamen = $repository->find($id);

        if (!$centreExamen) {
            throw new NotFoundHttpException('Centre d\'examen non trouvé');
        }

        $ville = $centreExamen->getVille();

        // Construire la réponse
        $responseData = [
            'id' => $centreExamen->getId(),
            'libelle' => $centreExamen->getLibelle(),
            'adresse' => $centreExamen->getAdresse(),
            'latitude' => $centreExamen->getLatitude(),
            'longitude' => $centreExamen->getLongitude(),
            'ville' => $ville ? [
                'id' => $ville->getId(),
                'code' => $ville->getCode(),
                'libelle' => $ville->getLibelle(),
                'region' => $ville->getRegion(),
                'departement' => $ville->getDepartement(),
                'latitude' => $ville->getLatitude(),
                'longitude' => $ville->getLongitude(),
                'code_postal' => $ville->getCodePostal(),
                'createdAt' => $ville->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $ville->getUpdatedAt()->format('Y-m-d H:i:s'),
            ] : null,
            'pays' => $ville ? $ville->getPays()->getLibelle() : null,
            'createdAt' => $centreExamen->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $centreExamen->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];

        return new JsonResponse($responseData, Response::HTTP_OK);
    }

    #[Route('/{id}/circuits-proches', name: 'circuits_proches_centre', methods: ['GET'])]
    public function getCircuitsProchesCentre(int $id): JsonResponse
    {
        $MAX_DISTANCE = 20; // En km
        $centre = $this->entityManager->getRepository(CentreExamen::class)->find($id);

        if (!$centre) {
            return new JsonResponse(['error' => 'Centre d\'examen non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $centreLat = floatval($centre->getLatitude());
        $centreLon = floatval($centre->getLongitude());

        $circuits = $this->entityManager->getRepository(Circuit::class)->findAll();
        $result = [];

        foreach ($circuits as $circuit) {
            $points = [];

            // Récupération et formatage des points
            foreach ($circuit->getPoints() as $point) {
                $points[] = [
                    'id' => $point->getId(),
                    'libelle' => $point->getLibelle() ?? 'Point ' . $point->getId(),
                    'latitude' => floatval($point->getLatitude()),
                    'longitude' => floatval($point->getLongitude()),
                    'description' => $point->getDescription() ?? 'Point ' . $point->getId(),
                    'rang' => $point->getRang() ?? 0,
                    'type' => $point->getType() ?? 'information',
                ];
            }

            // Coordonnées pour distance (premier point ou fallback ville)
            if (count($points) > 0) {
                $circuitLat = $points[0]['latitude'];
                $circuitLon = $points[0]['longitude'];
            } else {
                $ville = $circuit->getVilleCentre();
                if (!$ville || !$ville->getLatitude() || !$ville->getLongitude()) continue;
                $circuitLat = floatval($ville->getLatitude());
                $circuitLon = floatval($ville->getLongitude());
            }

            // Calcul de la distance
            $distance = $this->haversine($centreLat, $centreLon, $circuitLat, $circuitLon);

            if ($distance <= $MAX_DISTANCE) {
                usort($points, fn($a, $b) => $a['rang'] <=> $b['rang']);
                $result[] = [
                    'id' => $circuit->getId(),
                    'nom' => $circuit->getLibelle(),
                    'description' => $circuit->getDescription() ?? 'Aucune description',
                    'createur' => $circuit->getCreatedAt() ?? 'Anonyme',
                    'moniteur' => $circuit->getIdMoniteur() ? [
                        'id' => $circuit->getIdMoniteur()->getId(),
                        'nom' => $circuit->getIdMoniteur()->getCompte()->getNom(),
                        'prenom' => $circuit->getIdMoniteur()->getCompte()->getNom(),

                    ] : null,
                    'points' => $points
                ];
            }
        }

        return new JsonResponse($result, JsonResponse::HTTP_OK);
    }



    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
