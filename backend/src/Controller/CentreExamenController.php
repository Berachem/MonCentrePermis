<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\CentreExamenRepository;

#[Route('/api/custom/centre_examens')]
class CentreExamenController extends AbstractController
{
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
                'pays' => $ville ?  $ville->getPays()->getLibelle() : null,
                'createdAt' => $centreExamen->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $centreExamen->getUpdatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $centresExamen);

        return new JsonResponse($responseData, Response::HTTP_OK);
    }
}
