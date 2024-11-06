<?php

namespace App\Controller;

use App\Repository\AutoEcoleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/custom/auto_ecoles')]
class AutoEcoleController extends AbstractController
{
    #[Route('', name: 'api_auto_ecoles_list', methods: ['GET'])]
    public function list(AutoEcoleRepository $repository): JsonResponse
    {
        // Récupérer toutes les auto-écoles
        $autoEcoles = $repository->findAll();

        // Construire la réponse avec les données de la ville intégrées
        $responseData = array_map(function ($autoEcole) {
            $ville = $autoEcole->getVille();

            return [
                'id' => $autoEcole->getId(),
                'numero_agrement' => $autoEcole->getNumeroAgrement(),
                'adresse' => $autoEcole->getAdresse(),
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
                'createdAt' => $autoEcole->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $autoEcole->getUpdatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $autoEcoles);

        return new JsonResponse($responseData, Response::HTTP_OK);
    }
}
